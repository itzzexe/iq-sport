import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`divisions_story\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_story_order_idx\` ON \`divisions_story\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`divisions_story_parent_id_idx\` ON \`divisions_story\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_story_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions_story\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_story_locales_locale_parent_id_unique\` ON \`divisions_story_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_features_order_idx\` ON \`divisions_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`divisions_features_parent_id_idx\` ON \`divisions_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_features_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_features_locales_locale_parent_id_unique\` ON \`divisions_features_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_highlights_order_idx\` ON \`divisions_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`divisions_highlights_parent_id_idx\` ON \`divisions_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_highlights_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_highlights_locales_locale_parent_id_unique\` ON \`divisions_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`figure_value\` numeric,
  	\`figure_suffix\` text,
  	\`slug\` text,
  	\`icon\` text DEFAULT 'mark',
  	\`order\` numeric DEFAULT 0,
  	\`bookable\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_image_idx\` ON \`divisions\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_slug_idx\` ON \`divisions\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`divisions_updated_at_idx\` ON \`divisions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`divisions_created_at_idx\` ON \`divisions\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`divisions__status_idx\` ON \`divisions\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`divisions_locales\` (
  	\`title\` text,
  	\`kicker\` text,
  	\`summary\` text,
  	\`lede\` text,
  	\`figure_label\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_meta_meta_image_idx\` ON \`divisions_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_locales_locale_parent_id_unique\` ON \`divisions_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`branches_id\` integer,
  	\`coaches_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`branches_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`coaches_id\`) REFERENCES \`coaches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_rels_order_idx\` ON \`divisions_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`divisions_rels_parent_idx\` ON \`divisions_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`divisions_rels_path_idx\` ON \`divisions_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`divisions_rels_branches_id_idx\` ON \`divisions_rels\` (\`branches_id\`);`)
  await db.run(sql`CREATE INDEX \`divisions_rels_coaches_id_idx\` ON \`divisions_rels\` (\`coaches_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_story\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_story_order_idx\` ON \`_divisions_v_version_story\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_story_parent_id_idx\` ON \`_divisions_v_version_story\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_story_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v_version_story\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_divisions_v_version_story_locales_locale_parent_id_unique\` ON \`_divisions_v_version_story_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_features_order_idx\` ON \`_divisions_v_version_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_features_parent_id_idx\` ON \`_divisions_v_version_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_features_locales\` (
  	\`title\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v_version_features\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_divisions_v_version_features_locales_locale_parent_id_uniqu\` ON \`_divisions_v_version_features_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_highlights_order_idx\` ON \`_divisions_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_highlights_parent_id_idx\` ON \`_divisions_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_version_highlights_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_divisions_v_version_highlights_locales_locale_parent_id_uni\` ON \`_divisions_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_image_id\` integer,
  	\`version_figure_value\` numeric,
  	\`version_figure_suffix\` text,
  	\`version_slug\` text,
  	\`version_icon\` text DEFAULT 'mark',
  	\`version_order\` numeric DEFAULT 0,
  	\`version_bookable\` integer DEFAULT true,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_parent_idx\` ON \`_divisions_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_version_image_idx\` ON \`_divisions_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_version_slug_idx\` ON \`_divisions_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_version_updated_at_idx\` ON \`_divisions_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_version_created_at_idx\` ON \`_divisions_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_version__status_idx\` ON \`_divisions_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_created_at_idx\` ON \`_divisions_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_updated_at_idx\` ON \`_divisions_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_snapshot_idx\` ON \`_divisions_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_published_locale_idx\` ON \`_divisions_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_latest_idx\` ON \`_divisions_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_locales\` (
  	\`version_title\` text,
  	\`version_kicker\` text,
  	\`version_summary\` text,
  	\`version_lede\` text,
  	\`version_figure_label\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_divisions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_version_meta_version_meta_image_idx\` ON \`_divisions_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_divisions_v_locales_locale_parent_id_unique\` ON \`_divisions_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_divisions_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`branches_id\` integer,
  	\`coaches_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_divisions_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`branches_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`coaches_id\`) REFERENCES \`coaches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_divisions_v_rels_order_idx\` ON \`_divisions_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_rels_parent_idx\` ON \`_divisions_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_rels_path_idx\` ON \`_divisions_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_rels_branches_id_idx\` ON \`_divisions_v_rels\` (\`branches_id\`);`)
  await db.run(sql`CREATE INDEX \`_divisions_v_rels_coaches_id_idx\` ON \`_divisions_v_rels\` (\`coaches_id\`);`)
  await db.run(sql`CREATE TABLE \`branches_facilities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`branches_facilities_order_idx\` ON \`branches_facilities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`branches_facilities_parent_id_idx\` ON \`branches_facilities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`branches_facilities_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`branches_facilities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`branches_facilities_locales_locale_parent_id_unique\` ON \`branches_facilities_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`branches\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`phone\` text,
  	\`whatsapp\` text,
  	\`maps_url\` text,
  	\`geo_lat\` numeric,
  	\`geo_lng\` numeric,
  	\`map_position_x\` numeric DEFAULT 50,
  	\`map_position_y\` numeric DEFAULT 50,
  	\`slug\` text,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`branches_image_idx\` ON \`branches\` (\`image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`branches_slug_idx\` ON \`branches\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`branches_updated_at_idx\` ON \`branches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`branches_created_at_idx\` ON \`branches\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`branches__status_idx\` ON \`branches\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`branches_locales\` (
  	\`title\` text,
  	\`area\` text,
  	\`address\` text,
  	\`hours\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`branches_locales_locale_parent_id_unique\` ON \`branches_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_branches_v_version_facilities\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_branches_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_branches_v_version_facilities_order_idx\` ON \`_branches_v_version_facilities\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_facilities_parent_id_idx\` ON \`_branches_v_version_facilities\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_branches_v_version_facilities_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_branches_v_version_facilities\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_branches_v_version_facilities_locales_locale_parent_id_uniq\` ON \`_branches_v_version_facilities_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_branches_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_image_id\` integer,
  	\`version_phone\` text,
  	\`version_whatsapp\` text,
  	\`version_maps_url\` text,
  	\`version_geo_lat\` numeric,
  	\`version_geo_lng\` numeric,
  	\`version_map_position_x\` numeric DEFAULT 50,
  	\`version_map_position_y\` numeric DEFAULT 50,
  	\`version_slug\` text,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_branches_v_parent_idx\` ON \`_branches_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_version_image_idx\` ON \`_branches_v\` (\`version_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_version_slug_idx\` ON \`_branches_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_version_updated_at_idx\` ON \`_branches_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_version_created_at_idx\` ON \`_branches_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_version_version__status_idx\` ON \`_branches_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_created_at_idx\` ON \`_branches_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_updated_at_idx\` ON \`_branches_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_snapshot_idx\` ON \`_branches_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_published_locale_idx\` ON \`_branches_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_branches_v_latest_idx\` ON \`_branches_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_branches_v_locales\` (
  	\`version_title\` text,
  	\`version_area\` text,
  	\`version_address\` text,
  	\`version_hours\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_branches_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_branches_v_locales_locale_parent_id_unique\` ON \`_branches_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`coaches\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`photo_id\` integer,
  	\`division_id\` integer,
  	\`branch_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`division_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`coaches_photo_idx\` ON \`coaches\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`coaches_division_idx\` ON \`coaches\` (\`division_id\`);`)
  await db.run(sql`CREATE INDEX \`coaches_branch_idx\` ON \`coaches\` (\`branch_id\`);`)
  await db.run(sql`CREATE INDEX \`coaches_updated_at_idx\` ON \`coaches\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`coaches_created_at_idx\` ON \`coaches\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`coaches__status_idx\` ON \`coaches\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`coaches_locales\` (
  	\`name\` text,
  	\`role\` text,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`coaches\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`coaches_locales_locale_parent_id_unique\` ON \`coaches_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_coaches_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_photo_id\` integer,
  	\`version_division_id\` integer,
  	\`version_branch_id\` integer,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`coaches\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_division_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_branch_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_coaches_v_parent_idx\` ON \`_coaches_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version_photo_idx\` ON \`_coaches_v\` (\`version_photo_id\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version_division_idx\` ON \`_coaches_v\` (\`version_division_id\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version_branch_idx\` ON \`_coaches_v\` (\`version_branch_id\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version_updated_at_idx\` ON \`_coaches_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version_created_at_idx\` ON \`_coaches_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_version_version__status_idx\` ON \`_coaches_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_created_at_idx\` ON \`_coaches_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_updated_at_idx\` ON \`_coaches_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_snapshot_idx\` ON \`_coaches_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_published_locale_idx\` ON \`_coaches_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_coaches_v_latest_idx\` ON \`_coaches_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_coaches_v_locales\` (
  	\`version_name\` text,
  	\`version_role\` text,
  	\`version_bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_coaches_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_coaches_v_locales_locale_parent_id_unique\` ON \`_coaches_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_highlights_order_idx\` ON \`tournaments_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_highlights_parent_id_idx\` ON \`tournaments_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_highlights_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`tournaments_highlights_locales_locale_parent_id_unique\` ON \`tournaments_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_gallery_order_idx\` ON \`tournaments_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_gallery_parent_id_idx\` ON \`tournaments_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_gallery_image_idx\` ON \`tournaments_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`cover_id\` integer,
  	\`start_date\` text,
  	\`end_date\` text,
  	\`division_id\` integer,
  	\`branch_id\` integer,
  	\`registration_url\` text,
  	\`kind\` text DEFAULT 'tournament',
  	\`slug\` text,
  	\`featured\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`division_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_cover_idx\` ON \`tournaments\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_division_idx\` ON \`tournaments\` (\`division_id\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_branch_idx\` ON \`tournaments\` (\`branch_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`tournaments_slug_idx\` ON \`tournaments\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_updated_at_idx\` ON \`tournaments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`tournaments_created_at_idx\` ON \`tournaments\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`tournaments__status_idx\` ON \`tournaments\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_locales\` (
  	\`title\` text,
  	\`summary\` text,
  	\`body\` text,
  	\`location\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_meta_meta_image_idx\` ON \`tournaments_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`tournaments_locales_locale_parent_id_unique\` ON \`tournaments_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tournaments_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tournaments_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_highlights_order_idx\` ON \`_tournaments_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_highlights_parent_id_idx\` ON \`_tournaments_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tournaments_v_version_highlights_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tournaments_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_tournaments_v_version_highlights_locales_locale_parent_id_u\` ON \`_tournaments_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_tournaments_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tournaments_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_gallery_order_idx\` ON \`_tournaments_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_gallery_parent_id_idx\` ON \`_tournaments_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_gallery_image_idx\` ON \`_tournaments_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_tournaments_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_cover_id\` integer,
  	\`version_start_date\` text,
  	\`version_end_date\` text,
  	\`version_division_id\` integer,
  	\`version_branch_id\` integer,
  	\`version_registration_url\` text,
  	\`version_kind\` text DEFAULT 'tournament',
  	\`version_slug\` text,
  	\`version_featured\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_division_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_branch_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_tournaments_v_parent_idx\` ON \`_tournaments_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_cover_idx\` ON \`_tournaments_v\` (\`version_cover_id\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_division_idx\` ON \`_tournaments_v\` (\`version_division_id\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_branch_idx\` ON \`_tournaments_v\` (\`version_branch_id\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_slug_idx\` ON \`_tournaments_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_updated_at_idx\` ON \`_tournaments_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version_created_at_idx\` ON \`_tournaments_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_version__status_idx\` ON \`_tournaments_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_created_at_idx\` ON \`_tournaments_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_updated_at_idx\` ON \`_tournaments_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_snapshot_idx\` ON \`_tournaments_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_published_locale_idx\` ON \`_tournaments_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_tournaments_v_latest_idx\` ON \`_tournaments_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_tournaments_v_locales\` (
  	\`version_title\` text,
  	\`version_summary\` text,
  	\`version_body\` text,
  	\`version_location\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_tournaments_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_tournaments_v_version_meta_version_meta_image_idx\` ON \`_tournaments_v_locales\` (\`version_meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_tournaments_v_locales_locale_parent_id_unique\` ON \`_tournaments_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`bookings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`phone\` text NOT NULL,
  	\`branch_id\` integer,
  	\`division_id\` integer,
  	\`date\` text,
  	\`notes\` text,
  	\`status\` text DEFAULT 'new' NOT NULL,
  	\`locale\` text,
  	\`source\` text DEFAULT 'website',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`branch_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`division_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`bookings_branch_idx\` ON \`bookings\` (\`branch_id\`);`)
  await db.run(sql`CREATE INDEX \`bookings_division_idx\` ON \`bookings\` (\`division_id\`);`)
  await db.run(sql`CREATE INDEX \`bookings_updated_at_idx\` ON \`bookings\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`bookings_created_at_idx\` ON \`bookings\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_wide_url\` text,
  	\`sizes_wide_width\` numeric,
  	\`sizes_wide_height\` numeric,
  	\`sizes_wide_mime_type\` text,
  	\`sizes_wide_filesize\` numeric,
  	\`sizes_wide_filename\` text,
  	\`sizes_hero_url\` text,
  	\`sizes_hero_width\` numeric,
  	\`sizes_hero_height\` numeric,
  	\`sizes_hero_mime_type\` text,
  	\`sizes_hero_filesize\` numeric,
  	\`sizes_hero_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_wide_sizes_wide_filename_idx\` ON \`media\` (\`sizes_wide_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_hero_sizes_hero_filename_idx\` ON \`media\` (\`sizes_hero_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`divisions_id\` integer,
  	\`branches_id\` integer,
  	\`coaches_id\` integer,
  	\`tournaments_id\` integer,
  	\`bookings_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`divisions_id\`) REFERENCES \`divisions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`branches_id\`) REFERENCES \`branches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`coaches_id\`) REFERENCES \`coaches\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`tournaments_id\`) REFERENCES \`tournaments\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`bookings_id\`) REFERENCES \`bookings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_divisions_id_idx\` ON \`payload_locked_documents_rels\` (\`divisions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_branches_id_idx\` ON \`payload_locked_documents_rels\` (\`branches_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_coaches_id_idx\` ON \`payload_locked_documents_rels\` (\`coaches_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_tournaments_id_idx\` ON \`payload_locked_documents_rels\` (\`tournaments_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_bookings_id_idx\` ON \`payload_locked_documents_rels\` (\`bookings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`settings_socials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_socials_order_idx\` ON \`settings_socials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_socials_parent_id_idx\` ON \`settings_socials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`page\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_nav_order_idx\` ON \`settings_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_nav_parent_id_idx\` ON \`settings_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_nav_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`settings_nav_locales_locale_parent_id_unique\` ON \`settings_nav_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_keywords_order_idx\` ON \`settings_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_keywords_parent_id_idx\` ON \`settings_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_keywords_locales\` (
  	\`keyword\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings_keywords\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`settings_keywords_locales_locale_parent_id_unique\` ON \`settings_keywords_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`phone\` text,
  	\`whatsapp\` text,
  	\`email\` text,
  	\`maps_url\` text,
  	\`site_url\` text,
  	\`og_image_id\` integer,
  	\`allow_indexing\` integer DEFAULT true,
  	\`google_site_verification\` text,
  	\`seeded_at\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_logo_idx\` ON \`settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_og_image_idx\` ON \`settings\` (\`og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_locales\` (
  	\`site_name\` text NOT NULL,
  	\`short_name\` text,
  	\`tagline\` text,
  	\`address\` text,
  	\`city\` text,
  	\`country\` text,
  	\`hours\` text,
  	\`footer_text\` text,
  	\`copyright\` text,
  	\`default_title\` text,
  	\`default_description\` text,
  	\`labels_menu\` text,
  	\`labels_footer_nav\` text,
  	\`labels_close\` text,
  	\`labels_skip_to_content\` text,
  	\`labels_switch_language\` text,
  	\`labels_book_now\` text,
  	\`labels_back_home\` text,
  	\`labels_back_to_sections\` text,
  	\`labels_scroll_hint\` text,
  	\`labels_loading\` text,
  	\`labels_explore\` text,
  	\`labels_lane\` text,
  	\`labels_journey_hint\` text,
  	\`labels_start_line\` text,
  	\`labels_finish_line\` text,
  	\`labels_all_divisions\` text,
  	\`labels_learn_more\` text,
  	\`labels_details\` text,
  	\`labels_view_all\` text,
  	\`labels_rights\` text,
  	\`labels_back_to_top\` text,
  	\`labels_not_found_title\` text,
  	\`labels_not_found_body\` text,
  	\`labels_phone\` text,
  	\`labels_whatsapp\` text,
  	\`labels_email\` text,
  	\`labels_address\` text,
  	\`labels_hours\` text,
  	\`labels_follow\` text,
  	\`labels_view_on_map\` text,
  	\`labels_call\` text,
  	\`labels_available_at\` text,
  	\`labels_coaches\` text,
  	\`labels_book_this\` text,
  	\`labels_other_divisions\` text,
  	\`labels_features\` text,
  	\`labels_branch\` text,
  	\`labels_facilities\` text,
  	\`labels_book_here\` text,
  	\`labels_rush_hours\` text,
  	\`labels_division\` text,
  	\`labels_all\` text,
  	\`labels_tournaments\` text,
  	\`labels_courses\` text,
  	\`labels_upcoming\` text,
  	\`labels_past\` text,
  	\`labels_date\` text,
  	\`labels_location\` text,
  	\`labels_register\` text,
  	\`labels_gallery\` text,
  	\`labels_tournament\` text,
  	\`labels_course\` text,
  	\`labels_form_name\` text,
  	\`labels_form_phone\` text,
  	\`labels_form_branch\` text,
  	\`labels_form_activity\` text,
  	\`labels_form_date\` text,
  	\`labels_form_notes\` text,
  	\`labels_form_choose\` text,
  	\`labels_form_submit\` text,
  	\`labels_form_submitting\` text,
  	\`labels_form_whats_app\` text,
  	\`labels_form_required\` text,
  	\`labels_form_phone_invalid\` text,
  	\`labels_form_fix\` text,
  	\`labels_form_error\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`settings_locales_locale_parent_id_unique\` ON \`settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_paragraphs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_about_paragraphs_order_idx\` ON \`home_about_paragraphs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_about_paragraphs_parent_id_idx\` ON \`home_about_paragraphs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_paragraphs_locales\` (
  	\`text\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_about_paragraphs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_about_paragraphs_locales_locale_parent_id_unique\` ON \`home_about_paragraphs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_pillars\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_about_pillars_order_idx\` ON \`home_about_pillars\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_about_pillars_parent_id_idx\` ON \`home_about_pillars\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_about_pillars_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_about_pillars\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_about_pillars_locales_locale_parent_id_unique\` ON \`home_about_pillars_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home_sections_tiles\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`page\` text NOT NULL,
  	\`image_id\` integer,
  	\`enabled\` integer DEFAULT true,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_sections_tiles_order_idx\` ON \`home_sections_tiles\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`home_sections_tiles_parent_id_idx\` ON \`home_sections_tiles\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`home_sections_tiles_image_idx\` ON \`home_sections_tiles\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_sections_tiles_locales\` (
  	\`title\` text NOT NULL,
  	\`blurb\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home_sections_tiles\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`home_sections_tiles_locales_locale_parent_id_unique\` ON \`home_sections_tiles_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`home\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_background_id\` integer,
  	\`hero_primary_cta_target\` text,
  	\`hero_secondary_cta_target\` text,
  	\`about_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_background_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`about_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`home_hero_hero_background_idx\` ON \`home\` (\`hero_background_id\`);`)
  await db.run(sql`CREATE INDEX \`home_about_about_image_idx\` ON \`home\` (\`about_image_id\`);`)
  await db.run(sql`CREATE TABLE \`home_locales\` (
  	\`hero_title\` text NOT NULL,
  	\`hero_subtitle\` text,
  	\`hero_primary_cta_label\` text,
  	\`hero_secondary_cta_label\` text,
  	\`about_eyebrow\` text,
  	\`about_title\` text NOT NULL,
  	\`sections_eyebrow\` text,
  	\`sections_title\` text,
  	\`sections_intro\` text,
  	\`contact_eyebrow\` text,
  	\`contact_title\` text NOT NULL,
  	\`contact_body\` text,
  	\`contact_form_intro\` text,
  	\`contact_success_message\` text,
  	\`contact_note\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`home\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`home_meta_meta_image_idx\` ON \`home_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`home_locales_locale_parent_id_unique\` ON \`home_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`divisions_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`divisions_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`divisions_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`divisions_page_meta_meta_image_idx\` ON \`divisions_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`divisions_page_locales_locale_parent_id_unique\` ON \`divisions_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`branches_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`map_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`map_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`branches_page_map_image_idx\` ON \`branches_page\` (\`map_image_id\`);`)
  await db.run(sql`CREATE TABLE \`branches_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`map_caption\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`branches_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`branches_page_meta_meta_image_idx\` ON \`branches_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`branches_page_locales_locale_parent_id_unique\` ON \`branches_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_page_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` numeric NOT NULL,
  	\`suffix\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`statistics_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`statistics_page_stats_order_idx\` ON \`statistics_page_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`statistics_page_stats_parent_id_idx\` ON \`statistics_page_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_page_stats_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`statistics_page_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`statistics_page_stats_locales_locale_parent_id_unique\` ON \`statistics_page_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_page_reasons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`statistics_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`statistics_page_reasons_order_idx\` ON \`statistics_page_reasons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`statistics_page_reasons_parent_id_idx\` ON \`statistics_page_reasons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_page_reasons_locales\` (
  	\`title\` text NOT NULL,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`statistics_page_reasons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`statistics_page_reasons_locales_locale_parent_id_unique\` ON \`statistics_page_reasons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`statistics_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`rush_hours_value\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`statistics_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`rush_hours_label\` text,
  	\`why_eyebrow\` text,
  	\`closing_title\` text,
  	\`closing_body\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`statistics_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`statistics_page_meta_meta_image_idx\` ON \`statistics_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`statistics_page_locales_locale_parent_id_unique\` ON \`statistics_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`team_page_summary\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`team_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`team_page_summary_order_idx\` ON \`team_page_summary\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`team_page_summary_parent_id_idx\` ON \`team_page_summary\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`team_page_summary_locales\` (
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`team_page_summary\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`team_page_summary_locales_locale_parent_id_unique\` ON \`team_page_summary_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`team_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`team_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`team_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`team_page_meta_meta_image_idx\` ON \`team_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`team_page_locales_locale_parent_id_unique\` ON \`team_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`tournaments_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`tournaments_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`empty_message\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`tournaments_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`tournaments_page_meta_meta_image_idx\` ON \`tournaments_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`tournaments_page_locales_locale_parent_id_unique\` ON \`tournaments_page_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page_values\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vision_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`vision_page_values_order_idx\` ON \`vision_page_values\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`vision_page_values_parent_id_idx\` ON \`vision_page_values\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page_values_locales\` (
  	\`title\` text NOT NULL,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vision_page_values\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`vision_page_values_locales_locale_parent_id_unique\` ON \`vision_page_values_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`vision_page_image_idx\` ON \`vision_page\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`vision_page_locales\` (
  	\`eyebrow\` text,
  	\`title\` text NOT NULL,
  	\`intro\` text,
  	\`statement\` text NOT NULL,
  	\`mission\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`vision_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`vision_page_meta_meta_image_idx\` ON \`vision_page_locales\` (\`meta_image_id\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`vision_page_locales_locale_parent_id_unique\` ON \`vision_page_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`divisions_story\`;`)
  await db.run(sql`DROP TABLE \`divisions_story_locales\`;`)
  await db.run(sql`DROP TABLE \`divisions_features\`;`)
  await db.run(sql`DROP TABLE \`divisions_features_locales\`;`)
  await db.run(sql`DROP TABLE \`divisions_highlights\`;`)
  await db.run(sql`DROP TABLE \`divisions_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`divisions\`;`)
  await db.run(sql`DROP TABLE \`divisions_locales\`;`)
  await db.run(sql`DROP TABLE \`divisions_rels\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_story\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_story_locales\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_features\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_features_locales\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_divisions_v_rels\`;`)
  await db.run(sql`DROP TABLE \`branches_facilities\`;`)
  await db.run(sql`DROP TABLE \`branches_facilities_locales\`;`)
  await db.run(sql`DROP TABLE \`branches\`;`)
  await db.run(sql`DROP TABLE \`branches_locales\`;`)
  await db.run(sql`DROP TABLE \`_branches_v_version_facilities\`;`)
  await db.run(sql`DROP TABLE \`_branches_v_version_facilities_locales\`;`)
  await db.run(sql`DROP TABLE \`_branches_v\`;`)
  await db.run(sql`DROP TABLE \`_branches_v_locales\`;`)
  await db.run(sql`DROP TABLE \`coaches\`;`)
  await db.run(sql`DROP TABLE \`coaches_locales\`;`)
  await db.run(sql`DROP TABLE \`_coaches_v\`;`)
  await db.run(sql`DROP TABLE \`_coaches_v_locales\`;`)
  await db.run(sql`DROP TABLE \`tournaments_highlights\`;`)
  await db.run(sql`DROP TABLE \`tournaments_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`tournaments_gallery\`;`)
  await db.run(sql`DROP TABLE \`tournaments\`;`)
  await db.run(sql`DROP TABLE \`tournaments_locales\`;`)
  await db.run(sql`DROP TABLE \`_tournaments_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_tournaments_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_tournaments_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_tournaments_v\`;`)
  await db.run(sql`DROP TABLE \`_tournaments_v_locales\`;`)
  await db.run(sql`DROP TABLE \`bookings\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`settings_socials\`;`)
  await db.run(sql`DROP TABLE \`settings_nav\`;`)
  await db.run(sql`DROP TABLE \`settings_nav_locales\`;`)
  await db.run(sql`DROP TABLE \`settings_keywords\`;`)
  await db.run(sql`DROP TABLE \`settings_keywords_locales\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
  await db.run(sql`DROP TABLE \`settings_locales\`;`)
  await db.run(sql`DROP TABLE \`home_about_paragraphs\`;`)
  await db.run(sql`DROP TABLE \`home_about_paragraphs_locales\`;`)
  await db.run(sql`DROP TABLE \`home_about_pillars\`;`)
  await db.run(sql`DROP TABLE \`home_about_pillars_locales\`;`)
  await db.run(sql`DROP TABLE \`home_sections_tiles\`;`)
  await db.run(sql`DROP TABLE \`home_sections_tiles_locales\`;`)
  await db.run(sql`DROP TABLE \`home\`;`)
  await db.run(sql`DROP TABLE \`home_locales\`;`)
  await db.run(sql`DROP TABLE \`divisions_page\`;`)
  await db.run(sql`DROP TABLE \`divisions_page_locales\`;`)
  await db.run(sql`DROP TABLE \`branches_page\`;`)
  await db.run(sql`DROP TABLE \`branches_page_locales\`;`)
  await db.run(sql`DROP TABLE \`statistics_page_stats\`;`)
  await db.run(sql`DROP TABLE \`statistics_page_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`statistics_page_reasons\`;`)
  await db.run(sql`DROP TABLE \`statistics_page_reasons_locales\`;`)
  await db.run(sql`DROP TABLE \`statistics_page\`;`)
  await db.run(sql`DROP TABLE \`statistics_page_locales\`;`)
  await db.run(sql`DROP TABLE \`team_page_summary\`;`)
  await db.run(sql`DROP TABLE \`team_page_summary_locales\`;`)
  await db.run(sql`DROP TABLE \`team_page\`;`)
  await db.run(sql`DROP TABLE \`team_page_locales\`;`)
  await db.run(sql`DROP TABLE \`tournaments_page\`;`)
  await db.run(sql`DROP TABLE \`tournaments_page_locales\`;`)
  await db.run(sql`DROP TABLE \`vision_page_values\`;`)
  await db.run(sql`DROP TABLE \`vision_page_values_locales\`;`)
  await db.run(sql`DROP TABLE \`vision_page\`;`)
  await db.run(sql`DROP TABLE \`vision_page_locales\`;`)
}
