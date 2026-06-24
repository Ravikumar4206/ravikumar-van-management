import { Store } from './store.js';

let supabaseClient = null;

const TABLE_MAP = {
    'school_vans': 'vans',
    'school_drivers': 'drivers',
    'school_students': 'students',
    'school_trips': 'trips',
    'school_payments': 'payments'
};

const camelToSnake = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const snakeToCamel = str => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

function mapKeys(obj, keyMapper) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => mapKeys(item, keyMapper));

    const mapped = {};
    for (const [key, value] of Object.entries(obj)) {
        mapped[keyMapper(key)] = value;
    }
    return mapped;
}

export const Db = {
    init() {
        const settings = Store.get(Store.KEYS.SETTINGS) || {};
        if (settings.dbMode === 'supabase' && settings.supabaseUrl && settings.supabaseKey) {
            if (window.supabase) {
                try {
                    supabaseClient = window.supabase.createClient(settings.supabaseUrl, settings.supabaseKey);
                    console.log("Supabase Client initialized successfully.");
                    return true;
                } catch (e) {
                    console.error("Failed to initialize Supabase client:", e);
                    supabaseClient = null;
                    return false;
                }
            } else {
                console.warn("Supabase library not loaded yet.");
            }
        } else {
            supabaseClient = null;
        }
        return false;
    },

    isCloud() {
        return !!supabaseClient;
    },

    async testConnection(url, key) {
        if (!window.supabase) return { success: false, message: "Supabase client library not loaded." };
        try {
            const client = window.supabase.createClient(url, key);
            // Query a simple select from vans to check connection
            const { data, error } = await client.from('vans').select('*').limit(1);
            if (error) {
                return { success: false, message: error.message };
            }
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message };
        }
    },

    async getAll(key) {
        const settings = Store.get(Store.KEYS.SETTINGS) || {};
        if (settings.dbMode === 'supabase' && supabaseClient) {
            const table = TABLE_MAP[key];
            if (table) {
                try {
                    const { data, error } = await supabaseClient.from(table).select('*');
                    if (error) {
                        console.error(`Supabase fetch error for table ${table}:`, error);
                        // Fallback to local storage on error
                        return Store.getAll(key);
                    }
                    return mapKeys(data, snakeToCamel);
                } catch (err) {
                    console.error(`Supabase runtime error for table ${table}:`, err);
                    return Store.getAll(key);
                }
            }
        }
        return Store.getAll(key);
    },

    async add(key, item) {
        const settings = Store.get(Store.KEYS.SETTINGS) || {};
        // Add to Local Storage first for fallback/offline sync
        Store.add(key, item);

        if (settings.dbMode === 'supabase' && supabaseClient) {
            const table = TABLE_MAP[key];
            if (table) {
                try {
                    const dbItem = mapKeys(item, camelToSnake);
                    const { error } = await supabaseClient.from(table).insert([dbItem]);
                    if (error) {
                        console.error(`Supabase insert error for table ${table}:`, error);
                    }
                } catch (err) {
                    console.error(`Supabase insert runtime error for table ${table}:`, err);
                }
            }
        }
        return item;
    },

    async update(key, idField, idValue, updatedFields) {
        const settings = Store.get(Store.KEYS.SETTINGS) || {};
        Store.update(key, idField, idValue, updatedFields);

        if (settings.dbMode === 'supabase' && supabaseClient) {
            const table = TABLE_MAP[key];
            if (table) {
                try {
                    const dbFields = mapKeys(updatedFields, camelToSnake);
                    const dbIdField = camelToSnake(idField);
                    const { error } = await supabaseClient.from(table).update(dbFields).eq(dbIdField, idValue);
                    if (error) {
                        console.error(`Supabase update error for table ${table}:`, error);
                    }
                } catch (err) {
                    console.error(`Supabase update runtime error for table ${table}:`, err);
                }
            }
        }
        return true;
    },

    async delete(key, idField, idValue) {
        const settings = Store.get(Store.KEYS.SETTINGS) || {};
        Store.delete(key, idField, idValue);

        if (settings.dbMode === 'supabase' && supabaseClient) {
            const table = TABLE_MAP[key];
            if (table) {
                try {
                    const dbIdField = camelToSnake(idField);
                    const { error } = await supabaseClient.from(table).delete().eq(dbIdField, idValue);
                    if (error) {
                        console.error(`Supabase delete error for table ${table}:`, error);
                    }
                } catch (err) {
                    console.error(`Supabase delete runtime error for table ${table}:`, err);
                }
            }
        }
        return true;
    },

    async syncLocalToCloud() {
        if (!supabaseClient) return false;
        try {
            console.log("Starting Local-to-Cloud Database Synchronization...");
            for (const [storeKey, dbTable] of Object.entries(TABLE_MAP)) {
                const localData = Store.getAll(storeKey);
                if (localData.length === 0) continue;

                // Map local camelCase rows to Supabase database snake_case fields
                const dbRows = mapKeys(localData, camelToSnake);
                // Supabase upsert will insert or update rows matching primary keys
                const { error } = await supabaseClient.from(dbTable).upsert(dbRows);
                if (error) {
                    console.error(`Sync failed for table ${dbTable}:`, error);
                } else {
                    console.log(`Synced table ${dbTable} successfully (${localData.length} records).`);
                }
            }
            return true;
        } catch (e) {
            console.error("Local to Cloud Database Sync Runtime error:", e);
            return false;
        }
    }
};
