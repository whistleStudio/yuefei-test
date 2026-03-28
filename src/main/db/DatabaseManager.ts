import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// --- 1. 定义数据接口 (Type Definitions) ---

export interface Device {
  id: number;
  sn: string;
  name: string;
  status: 'online' | 'offline' | 'error'; // 使用联合类型限制状态
  created_at: string; // SQLite 的 DATETIME 默认存为字符串
}

export interface Mission {
  id: number;
  name: string;
  points: string; // 存储 GeoJSON 字符串
  device_id: number | null;
  created_at: string;
}

// --- 2. 数据库管理类 ---

class DatabaseManager {
  private db: DatabaseType | null = null;
  private dbPath: string = '';

  constructor() {
    // 获取用户数据目录路径
    // 注意：如果在 constructor 中调用 app.getPath，需确保 app 模块已准备好
    // 通常在 app.whenReady() 之后调用 init 比较稳妥
    const userDataPath = app.getPath('userData');
    this.dbPath = path.join(userDataPath, 'drone_app.db');
    console.log(this.dbPath) // 输出数据库路径，便于调试
  }

  // 初始化数据库
  public init(): void {
    try {
      // 实例化数据库连接
      this.db = new Database(this.dbPath);
      
      // 开启 WAL 模式 (Write-Ahead Logging) 
      // 这对于 Electron 这种可能涉及并发读写的场景很有用
      this.db.pragma('journal_mode = WAL');
      
      // 开启外键支持
      this.db.pragma('foreign_keys = ON');
      
      console.log('✅ SQLite 数据库初始化成功:', this.dbPath);
      
      // 创建表
      this.createTables();
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error);
    }
  }

  // 建表语句
  private createTables(): void {
    if (!this.db) return;

    // 设备表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sn TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'offline',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 航线表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS missions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        points TEXT NOT NULL,
        device_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(device_id) REFERENCES devices(id)
      )
    `);
  }

  // --- 业务方法 ---

  // 添加设备
  public addDevice(sn: string, name: string): number {
    if (!this.db) throw new Error('Database not initialized');
    
    const stmt = this.db.prepare('INSERT INTO devices (sn, name) VALUES (?, ?)');
    const info = stmt.run(sn, name);
    
    // 返回最后插入的 ID
    return info.lastInsertRowid as number;
  }

  // 获取所有设备
  public getAllDevices(): Device[] {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM devices');
    // 类型断言：告诉 TS 返回的是 Device 数组
    return stmt.all() as Device[];
  }

  // 获取单个设备 (示例：根据 ID)
  public getDeviceById(id: number): Device | undefined {
    if (!this.db) throw new Error('Database not initialized');

    const stmt = this.db.prepare('SELECT * FROM devices WHERE id = ?');
    return stmt.get(id) as Device | undefined;
  }
  
  // 关闭数据库
  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('🔒 数据库连接已关闭');
    }
  }
}

// 导出单例
export default new DatabaseManager();