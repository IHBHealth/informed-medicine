import { Metadata } from "next";
import { Users, MessageSquare, Eye, Clock, Pin } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import forumPostsData from "@/data/forum-posts.json";
import type { ForumPost } from "@/lib/types";
import { SITE_URL, formatNumber, timeAgo, categoryLabel } from "@/lib/utils";

const forumPosts = forumPostsData as ForumPost[];

export const metadata: Metadata = {
  title: "Health Forum - Community Health Discussions",
  description:
    "Join our health community forum to discuss health topics, share experiences, and connect with others. Topics include heart health, mental health, nutrition, and more.",
  keywords: [
    "health forum",
    "health community",
    "health discussions",
    "medical community",
    "patient forum",
  ],
  openGraph: {
    title: "Health Forum - Community Health Discussions",
    description:
      "Join our health community forum to discuss health topics and share experiences.",
    type: "website",
    url: `${SITE_URL}/forum`,
    siteName: "InformedMedicine",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Forum - Community Health Discussions",
    description: "Community health discussions and shared experiences.",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE_URL}`,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Forum",
      item: `${SITE_URL}/forum`,
    },
  ],
};

const discussionForumJsonLd = {
  "@context": "https://schema.org",
  "@type": "DiscussionForumPosting",
  name: "InformedMedicine Health Forum",
  description:
    "Community health forum for discussing medical topics, sharing experiences, and connecting with others.",
  url: `${SITE_URL}/forum`,
};

export default function ForumPage() {
  const pinnedPosts = forumPosts.filter((p) => p.pinned);
  const regularPosts = forumPosts.filter((p) => !p.pinned);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/50">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={discussionForumJsonLd} />

      <div className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Forum" },
          ]}
        />

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Community Health Forum
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mb-6 leading-relaxed">
            Welcome to the InformedMedicine community forum. Connect with others who share
            your health journey, discuss medical topics, share experiences, and learn from
            our community. Whether you are managing a chronic condition, seeking wellness
            advice, or just curious about health topics, you will find supportive discussions
            here.
          </p>
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span>Active community</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>{forumPosts.length} discussions</span>
            </div>
          </div>
        </div>

        {pinnedPosts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Pin className="w-5 h-5 text-primary" />
              Pinned Discussions
            </h2>
            <div className="space-y-3">
              {pinnedPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 p-5"
                >
                  <div className="flex items-start gap-4">
                    <Pin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {categoryLabel(post.category)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {post.replyCount} replies
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {formatNumber(post.views)} views
                        </span>
                        <span>Posted by {post.authorName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Discussions</h2>
          <div className="space-y-3">
            {regularPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-border dark:border-slate-800 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {post.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {categoryLabel(post.category)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.replyCount} replies
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {formatNumber(post.views)} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(post.createdAt)}
                      </span>
                      <span>Posted by {post.authorName}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-border dark:border-slate-700 rounded-lg p-6">
          <div className="flex gap-3">
            <Users className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Community Guidelines</h3>
              <p className="text-sm text-muted-foreground">
                Please be respectful and supportive in all discussions. Do not share personal
                medical information that could identify you. Remember that forum posts do not
                constitute medical advice — always consult with a healthcare professional for
                medical decisions. Our moderators work to keep this space safe and helpful for
                everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
