import { relations } from "drizzle-orm"
import { pgEnum, pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import { project } from "./project.schema"

export const messageRoleEnum = pgEnum("message_role", ["USER", "ASSISTANT"])
export const messageTypeEnum = pgEnum("message_type", ["RESULT", "ERROR"])

export const message = pgTable("message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  content: text("content").notNull(),
  role: messageRoleEnum("role").notNull(),
  type: messageTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),
})

export const fragment = pgTable("fragment", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  messageId: text("message_id")
    .notNull()
    .unique()
    .references(() => message.id, { onDelete: "cascade" }),
  sandboxUrl: text("sandbox_url").notNull(),
  title: text("title").notNull(),
  files: jsonb("files").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const messageRelations = relations(message, ({ one }) => ({
  fragment: one(fragment),
  project: one(project, {
    fields: [message.projectId],
    references: [project.id],
  }),
}))

export const fragmentRelations = relations(fragment, ({ one }) => ({
  message: one(message, {
    fields: [fragment.messageId],
    references: [message.id],
  }),
}))
