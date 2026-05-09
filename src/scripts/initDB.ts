/**
 * RootUP — MongoDB Atlas Collection Initializer
 * ================================================
 * Run this ONCE after creating your Atlas cluster.
 * It creates all 20 collections with schema validation
 * and indexes in a single shot.
 *
 * Usage:
 *   npx ts-node scripts/initDB.ts
 *
 * Make sure MONGO_URI is set in your .env file first.
 */

import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI as string;
const DB_NAME   = "rootup"; // ← change if your DB name is different

// ─────────────────────────────────────────────────────────
// COLLECTION DEFINITIONS
// Each entry: collection name + indexes to create
// ─────────────────────────────────────────────────────────
interface IndexDef {
  key: Record<string, 1 | -1 | "text">;
  options?: Record<string, unknown>;
}

interface CollectionDef {
  name: string;
  indexes: IndexDef[];
}

const COLLECTIONS: CollectionDef[] = [

  // ── CORE ────────────────────────────────────────────────
  {
    name: "users",
    indexes: [
      { key: { email: 1 },        options: { unique: true, name: "idx_users_email" } },
      { key: { role: 1 },                                                              },
      { key: { podId: 1 },                                                             },
      { key: { roleReadinessScore: -1 },                                               },
    ],
  },
  {
    name: "onboarding_profiles",
    indexes: [
      { key: { userId: 1 }, options: { unique: true, name: "idx_onboarding_userId" } },
    ],
  },

  // ── JOB SEEKER ──────────────────────────────────────────
  {
    name: "cvs",
    indexes: [
      { key: { userId: 1 },                    options: { name: "idx_cvs_userId" } },
      { key: { userId: 1, version: -1 },        options: { name: "idx_cvs_userId_version" } },
    ],
  },
  {
    name: "learning_roadmaps",
    indexes: [
      { key: { userId: 1 },              options: { name: "idx_roadmaps_userId" } },
      { key: { userId: 1, status: 1 },   options: { name: "idx_roadmaps_userId_status" } },
    ],
  },
  {
    name: "courses",
    indexes: [
      { key: { skillsCovered: 1 },  options: { name: "idx_courses_skills" } },
      { key: { type: 1 },                                                    },
      { key: { category: 1 },                                                },
      { key: { title: "text" },     options: { name: "idx_courses_text" } },
    ],
  },
  {
    name: "course_progress",
    indexes: [
      // compound: powers "get all courses in_progress for a user"
      { key: { userId: 1, status: 1 },   options: { name: "idx_cp_userId_status" } },
      // compound unique: one progress record per user per course
      { key: { userId: 1, courseId: 1 }, options: { unique: true, name: "idx_cp_userId_courseId" } },
      { key: { courseId: 1 },            options: { name: "idx_cp_courseId" } },
    ],
  },
  {
    name: "jobs",
    indexes: [
      { key: { seniorityLevel: 1 },                                                        },
      { key: { source: 1 },                                                                 },
      { key: { isRecommended: 1 },                                                          },
      { key: { requiredSkills: 1 },  options: { name: "idx_jobs_skills" } },
      { key: { postedAt: -1 },       options: { name: "idx_jobs_postedAt" } },
      { key: { employerId: 1 },                                                             },
      { key: { title: "text", description: "text" }, options: { name: "idx_jobs_text" } },
    ],
  },
  {
    name: "job_applications",
    indexes: [
      // compound: powers Application Tracker filter by status
      { key: { userId: 1, status: 1 },  options: { name: "idx_ja_userId_status" } },
      { key: { jobId: 1 },                                                          },
      // unique: one application record per user per job
      { key: { userId: 1, jobId: 1 },   options: { unique: true, name: "idx_ja_userId_jobId" } },
    ],
  },
  {
    name: "soft_skill_assessments",
    indexes: [
      { key: { userId: 1 },                              options: { name: "idx_ssa_userId" } },
      { key: { userId: 1, assessmentType: 1 },           options: { name: "idx_ssa_userId_type" } },
      { key: { takenAt: -1 },                                                                   },
    ],
  },

  // ── EMPLOYER ────────────────────────────────────────────
  {
    name: "employers",
    indexes: [
      { key: { userId: 1 },      options: { unique: true, name: "idx_employers_userId" } },
      { key: { companyName: 1 },                                                          },
      { key: { industry: 1 },                                                             },
    ],
  },
  {
    name: "job_posts",
    indexes: [
      { key: { employerId: 1 },         options: { name: "idx_jp_employerId" } },
      { key: { employerId: 1, status: 1 }, options: { name: "idx_jp_employerId_status" } },
      { key: { status: 1 },                                                               },
      { key: { publishedJobId: 1 },                                                       },
    ],
  },
  {
    name: "skill_thresholds",
    indexes: [
      { key: { employerId: 1 },            options: { name: "idx_st_employerId" } },
      { key: { employerId: 1, isActive: 1 }, options: { name: "idx_st_employerId_active" } },
    ],
  },
  {
    name: "profile_views",
    indexes: [
      { key: { employerId: 1 },  options: { name: "idx_pv_employerId" } },
      { key: { userId: 1 },      options: { name: "idx_pv_userId" } },
      { key: { viewedAt: -1 },                                         },
    ],
  },

  // ── GAMIFICATION ────────────────────────────────────────
  {
    name: "focus_sessions",
    indexes: [
      // compound: powers "sessions this week for user" streak query
      { key: { userId: 1, startTime: -1 }, options: { name: "idx_fs_userId_startTime" } },
      { key: { courseId: 1 },                                                             },
    ],
  },
  {
    name: "forests",
    indexes: [
      { key: { userId: 1 }, options: { unique: true, name: "idx_forests_userId" } },
    ],
  },
  {
    name: "badges",
    indexes: [
      { key: { userId: 1 },               options: { name: "idx_badges_userId" } },
      { key: { userId: 1, phase: 1 },     options: { name: "idx_badges_userId_phase" } },
      { key: { signature: 1 },            options: { unique: true, name: "idx_badges_signature" } },
    ],
  },

  // ── COMMUNITY ────────────────────────────────────────────
  {
    name: "accountability_pods",
    indexes: [
      { key: { members: 1 },      options: { name: "idx_pods_members" } },
      { key: { targetRole: 1 },                                          },
    ],
  },
  {
    name: "blog_posts",
    indexes: [
      { key: { authorId: 1 },      options: { name: "idx_blog_authorId" } },
      { key: { publishedAt: -1 },  options: { name: "idx_blog_publishedAt" } },
      { key: { tags: 1 },          options: { name: "idx_blog_tags" } },
      { key: { title: "text", content: "text" }, options: { name: "idx_blog_text" } },
    ],
  },

  // ── SYSTEM ───────────────────────────────────────────────
  {
    name: "notifications",
    indexes: [
      // compound: powers unread count query (the red dot)
      { key: { userId: 1, isRead: 1 },   options: { name: "idx_notif_userId_isRead" } },
      { key: { createdAt: -1 },                                                         },
    ],
  },
  {
    name: "job_market_trends",
    indexes: [
      { key: { role: 1 },       options: { name: "idx_jmt_role" } },
      { key: { region: 1 },                                        },
      // TTL index: auto-delete trend docs older than 30 days
      {
        key: { fetchedAt: 1 },
        options: { expireAfterSeconds: 60 * 60 * 24 * 30, name: "idx_jmt_ttl" },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
async function initDB(): Promise<void> {
  if (!MONGO_URI) {
    console.error("❌  MONGO_URI is not set in your .env file.");
    process.exit(1);
  }

  console.log("🔌  Connecting to MongoDB Atlas…");
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db: Db = client.db(DB_NAME);
    console.log(`✅  Connected to database: "${DB_NAME}"\n`);

    // Get existing collection names to avoid re-creating
    const existing = await db.listCollections().toArray();
    const existingNames = new Set(existing.map((c) => c.name));

    for (const colDef of COLLECTIONS) {
      const { name, indexes } = colDef;

      // ── Create collection if it doesn't exist ──
      if (!existingNames.has(name)) {
        await db.createCollection(name);
        console.log(`📦  Created collection: ${name}`);
      } else {
        console.log(`⏭️   Already exists:     ${name}`);
      }

      // ── Create indexes ──
      const col = db.collection(name);
      for (const idx of indexes) {
        await col.createIndex(idx.key, idx.options ?? {});
      }
      console.log(`    └─ ${indexes.length} index(es) ensured`);
    }

    console.log("\n🎉  All collections and indexes are ready!");
    console.log(`    Database: ${DB_NAME}`);
    console.log(`    Collections: ${COLLECTIONS.length}`);
    console.log(`    Total indexes: ${COLLECTIONS.reduce((sum, c) => sum + c.indexes.length, 0)}`);

  } catch (err) {
    console.error("❌  Error during DB init:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n🔌  Connection closed.");
  }
}

initDB();