-- 000020_feed_filters.sql

-- 1. Create table for hidden posts
CREATE TABLE public.hidden_posts (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);

-- Enable RLS for hidden_posts
ALTER TABLE public.hidden_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hidden posts" ON public.hidden_posts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can hide posts" ON public.hidden_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unhide posts" ON public.hidden_posts
    FOR DELETE USING (auth.uid() = user_id);


-- 2. Drop the old feed_posts SELECT policy
DROP POLICY IF EXISTS "Users can view all feed posts" ON public.feed_posts;

-- 3. Create the new feed_posts SELECT policy with filtering
-- Note: A user cannot see a post if:
-- a) They have blocked the author.
-- b) The author has blocked them.
-- c) They have manually hidden the post.
CREATE POLICY "Users can view feed posts with filters" ON public.feed_posts
    FOR SELECT USING (
        user_id NOT IN (
            SELECT blocked_id FROM public.blocks WHERE blocker_id = auth.uid()
        )
        AND
        user_id NOT IN (
            SELECT blocker_id FROM public.blocks WHERE blocked_id = auth.uid()
        )
        AND
        id NOT IN (
            SELECT post_id FROM public.hidden_posts WHERE user_id = auth.uid()
        )
    );
