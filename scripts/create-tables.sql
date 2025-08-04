-- Create the reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    votes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create the report_comments table
CREATE TABLE report_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
    comment_text TEXT NOT NULL,
    commenter_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
