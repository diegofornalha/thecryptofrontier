#!/usr/bin/env python3
"""
Analyze The Crypto Basic RSS feed and sitemap
"""

# Based on the analysis of multiple sitemaps:
# - post-sitemap.xml: 106 posts
# - post-sitemap2.xml: 100 posts  
# - post-sitemap22.xml: 138 posts
# - post-sitemap23.xml: 125 posts

def calculate_estimated_total():
    """Calculate estimated total posts based on sitemap analysis"""
    
    # We have 24 post sitemaps (post-sitemap.xml through post-sitemap23.xml)
    total_sitemaps = 24
    
    # Based on samples, sitemaps contain between 100-138 posts
    # Let's use conservative average of 115 posts per sitemap
    avg_posts_per_sitemap = 115
    
    estimated_total = total_sitemaps * avg_posts_per_sitemap
    
    return estimated_total

def print_analysis():
    """Print the analysis results"""
    
    print("=== The Crypto Basic RSS Feed Analysis ===\n")
    
    print("RSS Feed Analysis:")
    print("- Number of posts in RSS feed: 10")
    print("- The RSS feed only shows the 10 most recent posts")
    print("- No pagination information available in the RSS feed\n")
    
    print("Sitemap Analysis:")
    print("- Sitemap type: Sitemap index with 24 individual post sitemaps")
    print("- Date range: August 2021 to June 2025")
    print("- Posts per sitemap (samples):")
    print("  - post-sitemap.xml: 106 posts")
    print("  - post-sitemap2.xml: 100 posts")
    print("  - post-sitemap22.xml: 138 posts")
    print("  - post-sitemap23.xml: 125 posts\n")
    
    estimated_total = calculate_estimated_total()
    
    print(f"Estimated Total Posts: ~{estimated_total:,} posts")
    print(f"(Based on 24 sitemaps × ~115 posts average)\n")
    
    print("Key Findings:")
    print("1. The RSS feed is limited to only 10 most recent posts")
    print("2. To get all posts, you need to parse all 24 sitemap files")
    print("3. The site has been publishing since at least August 2021")
    print("4. Content focuses on cryptocurrency news, particularly XRP, Bitcoin, and altcoins")
    print("5. Some posts appear to have future dates (possibly scheduled posts)")

if __name__ == "__main__":
    print_analysis()