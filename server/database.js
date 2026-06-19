import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Warning: SUPABASE_URL or SUPABASE_KEY is missing from environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('Connected to Supabase client.');

const db = supabase;

const dbRun = async (sql, params = []) => {
  const sqlClean = sql.replace(/\s+/g, ' ').trim();
  
  try {
    // 1. UPDATE sub_units SET status = ?, notes = ? WHERE id = ?
    if (sqlClean.includes('UPDATE sub_units SET status = ?, notes = ? WHERE id = ?')) {
      const [status, notes, id] = params;
      const { error } = await supabase
        .from('sub_units')
        .update({ status, notes })
        .eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    // 2. UPDATE tasks SET completed_quantity = ?, progress_percent = ? WHERE id = ?
    if (sqlClean.includes('UPDATE tasks SET completed_quantity = ?, progress_percent = ? WHERE id = ?')) {
      const [completed, progress, taskId] = params;
      const { error } = await supabase
        .from('tasks')
        .update({ completed_quantity: completed, progress_percent: progress })
        .eq('id', taskId);
      if (error) throw error;
      return { changes: 1 };
    }

    // 3. INSERT INTO daily_updates
    if (sqlClean.includes('INSERT INTO daily_updates')) {
      let user_id = null;
      let sender_name = '';
      let sender_role = '';
      let message_text = '';
      let media_url = null;
      let media_type = null;
      let reply_to_id = null;

      if (sqlClean.includes('VALUES (null, ?, ?, ?, null, null, null)') || sqlClean.includes('VALUES (NULL, ?, ?, ?, NULL, NULL, NULL)')) {
        [sender_name, sender_role, message_text] = params;
      } else {
        [user_id, sender_name, sender_role, message_text, media_url, media_type, reply_to_id] = params;
      }

      const { data, error } = await supabase
        .from('daily_updates')
        .insert([{
          user_id,
          sender_name,
          sender_role,
          message_text,
          media_url,
          media_type,
          reply_to_id
        }])
        .select()
        .single();
      if (error) throw error;
      return { id: data.id, changes: 1 };
    }

    // 4. UPDATE tasks SET progress_percent = ?, completed_quantity = ? ... WHERE id = ?
    if (sqlClean.includes('UPDATE tasks SET progress_percent = ?, completed_quantity = ?')) {
      let updates = {
        progress_percent: params[0],
        completed_quantity: params[1]
      };
      let id;
      if (sqlClean.includes('notes = ?')) {
        updates.notes = params[2];
        id = params[3];
      } else {
        id = params[2];
      }
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    // 5. UPDATE tasks SET notes = ? WHERE id = ?
    if (sqlClean.includes('UPDATE tasks SET notes = ? WHERE id = ?')) {
      const [notes, id] = params;
      const { error } = await supabase
        .from('tasks')
        .update({ notes })
        .eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    // 6. UPDATE marble_distribution SET status = ?, white_qty = ?, brown_qty = ? WHERE id = ?
    if (sqlClean.includes('UPDATE marble_distribution SET status = ?, white_qty = ?, brown_qty = ? WHERE id = ?')) {
      const [status, white_qty, brown_qty, id] = params;
      const { error } = await supabase
        .from('marble_distribution')
        .update({ status, white_qty, brown_qty })
        .eq('id', id);
      if (error) throw error;
      return { changes: 1 };
    }

    throw new Error(`Unsupported write query: ${sql}`);
  } catch (err) {
    console.error('dbRun error:', err, 'SQL:', sql, 'params:', params);
    throw err;
  }
};

const dbGet = async (sql, params = []) => {
  const sqlClean = sql.replace(/\s+/g, ' ').trim();

  try {
    // 1. SELECT id, email, name, role FROM users WHERE email = ? AND password = ?
    if (sqlClean.includes('FROM users WHERE email = ? AND password = ?')) {
      const [email, password] = params;
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('email', email)
        .eq('password', password)
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    // 2. SELECT status, task_id, code, zone FROM sub_units WHERE id = ?
    if (sqlClean.includes('SELECT status, task_id, code, zone FROM sub_units WHERE id = ?')) {
      const { data, error } = await supabase
        .from('sub_units')
        .select('status, task_id, code, zone')
        .eq('id', params[0])
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    // 3. SELECT COUNT(*) as count FROM sub_units WHERE task_id = ?
    if (sqlClean.includes('COUNT(*) as count FROM sub_units WHERE task_id = ?')) {
      const taskId = params[0];
      let query = supabase
        .from('sub_units')
        .select('*', { count: 'exact', head: true })
        .eq('task_id', taskId);
      
      if (sqlClean.includes('status = ?')) {
        query = query.eq('status', params[1]);
      }

      const { count, error } = await query;
      if (error) throw error;
      return { count };
    }

    // 4. SELECT * FROM tasks WHERE id = ?
    if (sqlClean.includes('SELECT * FROM tasks WHERE id = ?')) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    // 5. SELECT * FROM marble_distribution WHERE id = ?
    if (sqlClean.includes('FROM marble_distribution WHERE id = ?')) {
      const { data, error } = await supabase
        .from('marble_distribution')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    // 6. SELECT d.* ... WHERE d.id = ?
    if (sqlClean.includes('daily_updates d') && sqlClean.includes('WHERE d.id = ?')) {
      const { data, error } = await supabase
        .from('daily_updates_with_users')
        .select('*')
        .eq('id', params[0])
        .maybeSingle();
      if (error) throw error;
      return data;
    }

    throw new Error(`Unsupported read-single query: ${sql}`);
  } catch (err) {
    console.error('dbGet error:', err, 'SQL:', sql, 'params:', params);
    throw err;
  }
};

const dbAll = async (sql, params = []) => {
  const sqlClean = sql.replace(/\s+/g, ' ').trim();

  try {
    // 1. SELECT * FROM categories
    if (sqlClean.includes('FROM categories')) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    }

    // 2. SELECT t.*, c.name as category_name FROM tasks t JOIN categories c ON t.category_id = c.id
    if (sqlClean.includes('FROM tasks t') && sqlClean.includes('JOIN categories c')) {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, categories(name)')
        .order('id', { ascending: true });
      if (error) throw error;
      return data.map(t => ({
        ...t,
        category_name: t.categories?.name
      }));
    }

    // 3. SELECT zone, status, COUNT(*) as count FROM sub_units GROUP BY zone, status
    if (sqlClean.includes('sub_units GROUP BY zone, status')) {
      const { data, error } = await supabase
        .from('sub_units_stats')
        .select('*');
      if (error) throw error;
      return data;
    }

    // 4. SELECT * FROM sub_units (with dynamic filters)
    if (sqlClean.includes('FROM sub_units')) {
      let query = supabase.from('sub_units').select('*').order('serial_number', { ascending: true });
      
      let paramIdx = 0;
      if (sqlClean.includes('zone = ?')) {
        query = query.eq('zone', params[paramIdx++]);
      }
      if (sqlClean.includes('status = ?')) {
        query = query.eq('status', params[paramIdx++]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }

    // 5. SELECT * FROM marble_distribution
    if (sqlClean.includes('FROM marble_distribution')) {
      const { data, error } = await supabase
        .from('marble_distribution')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    }

    // 6. SELECT d.* ... FROM daily_updates d ...
    if (sqlClean.includes('daily_updates d') && sqlClean.includes('LEFT JOIN users u')) {
      const { data, error } = await supabase
        .from('daily_updates_with_users')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    }

    throw new Error(`Unsupported read-multiple query: ${sql}`);
  } catch (err) {
    console.error('dbAll error:', err, 'SQL:', sql, 'params:', params);
    throw err;
  }
};

const initDatabase = async () => {
  console.log('Database initialized on Supabase.');
};

export {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDatabase
};
