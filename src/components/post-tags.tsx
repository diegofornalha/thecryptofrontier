import React from 'react';
import Link from 'next/link';

interface Tag {
  _id: string;
  title: string;
  slug: { current: string };
}

interface PostTagsProps {
  tags: Tag[];
  className?: string;
}

const PostTags: React.FC<PostTagsProps> = ({ tags, className = '' }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <span className="text-sm font-medium text-[#666] mr-2">Tags:</span>
      {tags.map((tag) => (
        <Link
          key={tag._id}
          href={`/tag/${tag.slug.current}`}
          className="inline-block bg-gray-100 hover:bg-[#4db2ec] hover:text-white text-gray-700 text-sm px-3 py-1 rounded transition-colors"
        >
          {tag.title}
        </Link>
      ))}
    </div>
  );
};

export default PostTags;