import {sqliteTable,text,integer,real,index} from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('events',{id:text('id').primaryKey(),title:text('title').notNull(),start:text('start').notNull(),end:text('end').notNull(),division:text('division').notNull(),category:text('category').notNull(),status:text('status').notNull(),owner:text('owner').notNull(),place:text('place').notNull(),notes:text('notes').notNull(),sortOrder:real('sort_order').notNull().default(0),deletedAt:text('deleted_at'),testBatch:text('test_batch'),creatorKey:text('creator_key').notNull().default(''),creatorName:text('creator_name').notNull().default(''),creatorAccount:text('creator_account').notNull().default(''),version:integer('version').notNull().default(1),updated:text('updated').notNull(),editor:text('editor').notNull()});
export const files=sqliteTable('files',{id:text('id').primaryKey(),eventId:text('event_id').notNull().references(()=>events.id),name:text('name').notNull(),kind:text('kind').notNull(),size:integer('size').notNull(),key:text('key').notNull()},t=>[index('files_event_idx').on(t.eventId)]);


export const staff=sqliteTable('staff',{id:text('id').primaryKey(),color:text('color').notNull().default('#68768b'),name:text('name').notNull(),role:text('role').notNull(),email:text('email').notNull(),loginEmail:text('login_email').unique(),passwordHash:text('password_hash').notNull().default(''),authVersion:integer('auth_version').notNull().default(1),isAdmin:integer('is_admin').notNull().default(0),version:integer('version').notNull().default(1),deletedAt:text('deleted_at'),updated:text('updated').notNull()});

export const regulations=sqliteTable('regulations',{id:text('id').primaryKey(),content:text('content').notNull(),version:integer('version').notNull().default(1),updated:text('updated').notNull(),editor:text('editor').notNull()});

export const memberSessions=sqliteTable('member_sessions',{tokenHash:text('token_hash').primaryKey(),memberId:text('member_id').notNull().references(()=>staff.id),authVersion:integer('auth_version').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('member_sessions_member_idx').on(t.memberId)]);
export const loginAttempts=sqliteTable('login_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),resetAt:integer('reset_at').notNull()});

