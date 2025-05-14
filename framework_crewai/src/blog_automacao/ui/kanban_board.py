"""
Kanban Board Component for the Streamlit interface.
This module provides a visual Kanban board for managing article workflow.
"""

import streamlit as st
from pathlib import Path
import json
from datetime import datetime
from ..logic.session_manager import SessionManager

def render_kanban_board():
    """Render a simplified Kanban board interface for content workflow"""
    
    # Header
    st.markdown(
        """
        <h1 style="text-align: center; margin-bottom: 20px;">📋 Content Workflow</h1>
        <p style="text-align: center; margin-bottom: 30px;">Drag articles through the workflow from RSS to publication</p>
        """, 
        unsafe_allow_html=True
    )
    
    # Define the columns for our board
    col1, col2, col3 = st.columns(3)
    
    with col1:
        render_pending_column()
    
    with col2:
        render_translation_column()
        
    with col3:
        render_publication_column()

def render_pending_column():
    """Renders the 'Pending' column with articles awaiting translation"""
    st.markdown(
        """
        <div style="background-color: #f0f4f8; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h3 style="text-align: center; margin: 0;">📥 Pending</h3>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Control buttons - simpler interface with emphasized buttons
    if st.button("📡 MONITOR RSS FEEDS", key="monitor_rss_btn", use_container_width=True, type="primary"):
        from ..logic.business_logic import monitor_feeds
        if monitor_feeds():
            st.success("RSS monitoring completed!")
            st.rerun()
        else:
            st.error("Error monitoring feeds")
    
    # Find articles to translate
    dir_posts = Path("posts_para_traduzir")
    if dir_posts.exists():
        articles = list(dir_posts.glob("para_traduzir_*.json"))
        
        if not articles:
            st.info("No pending articles found")
        else:
            st.success(f"{len(articles)} articles ready for translation")
            # Show each article card
            for article in articles:
                render_article_card(article, stage="pending")
    else:
        st.info("No pending articles found")

def render_translation_column():
    """Renders the 'Translation' column with translation status"""
    st.markdown(
        """
        <div style="background-color: #e6f3ff; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h3 style="text-align: center; margin: 0;">🔄 Translation</h3>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Translation controls
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔤 Translate Next", key="translate_next_btn", use_container_width=True):
            from ..logic.business_logic import translate_article
            if translate_article():
                st.success("Article translated!")
                st.rerun()
            else:
                st.error("Translation failed or no articles")
    
    with col2:
        if st.button("👁️ View Translated", key="view_translated_btn", use_container_width=True):
            st.rerun()
    
    # Find translated articles
    dir_posts = Path("posts_traduzidos")
    if dir_posts.exists():
        articles = [a for a in dir_posts.glob("*.json") if not a.name.startswith("para_traduzir_")]
        
        if not articles:
            st.info("No translated articles yet")
        else:
            st.success(f"{len(articles)} articles translated")
            # Show each article card
            for article in articles:
                render_article_card(article, stage="translated")
    else:
        st.info("No translated articles found")

def render_publication_column():
    """Renders the 'Publication' column with Sanity CMS status"""
    st.markdown(
        """
        <div style="background-color: #e6f9f0; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <h3 style="text-align: center; margin: 0;">🚀 Publication</h3>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    # Publication controls
    col1, col2 = st.columns(2)
    with col1:
        if st.button("📤 Publish Next", key="publish_next_btn", use_container_width=True):
            from ..logic.business_logic import publish_article
            if publish_article():
                st.success("Article published to Sanity!")
                st.rerun()
            else:
                st.error("Publication failed or no articles")
    
    with col2:
        if st.button("🔄 Refresh Sanity", key="refresh_sanity_btn", use_container_width=True):
            SessionManager.clear_sanity_cache()
            st.rerun()
    
    # Show published articles from Sanity CMS
    from ..logic.business_logic import fetch_sanity_posts
    posts = fetch_sanity_posts()
    
    if not posts:
        st.info("No published articles found in Sanity")
    else:
        # Show the 5 most recently published
        recent_posts = sorted(
            posts, 
            key=lambda p: p.get("publishedAt", ""), 
            reverse=True
        )[:5]
        
        st.success(f"{len(posts)} articles published to Sanity")
        
        for post in recent_posts:
            render_published_card(post)

def render_article_card(article_path, stage="pending"):
    """
    Renders a card for an article
    
    Args:
        article_path: Path to the article JSON file
        stage: The workflow stage (pending, translated)
    """
    try:
        with open(article_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Extract title based on article stage
        if stage == "pending":
            if "frontmatter_original" in data:
                title = data["frontmatter_original"].get("title", "No Title")
            else:
                title = data.get("title", "No Title")
        else:
            if "frontmatter_traduzido" in data and data["frontmatter_traduzido"]:
                title = data["frontmatter_traduzido"].get("title", "No Title")
            elif "frontmatter_original" in data:
                title = data["frontmatter_original"].get("title", "No Title")
            else:
                title = data.get("title", "No Title")
        
        # Create card UI with consistent styling and appropriate actions
        with st.container():
            st.markdown(
                f"""
                <div style="border: 1px solid #ddd; border-left: 5px solid {get_stage_color(stage)}; 
                            padding: 10px; border-radius: 5px; margin-bottom: 10px; 
                            background-color: white;">
                    <div style="font-weight: bold; margin-bottom: 8px;">{title[:50]}{'...' if len(title) > 50 else ''}</div>
                    <div style="color: #666; font-size: 0.8em; margin-bottom: 5px;">
                        {article_path.name[:20]}...
                    </div>
                </div>
                """, 
                unsafe_allow_html=True
            )
            
            # Card actions based on stage
            # Sem botões individuais para evitar inconsistências, usamos apenas os botões de ação coletiva no topo
            
            # Sem botões individuais para evitar inconsistências
    
    except Exception as e:
        st.error(f"Error loading article: {str(e)}")

def render_published_card(post):
    """
    Renders a card for a published article from Sanity
    
    Args:
        post: The Sanity post data
    """
    title = post.get("title", "No Title")
    published_at = post.get("publishedAt", "")
    post_id = post.get("_id", "")
    
    # Format date if available
    date_display = ""
    if published_at:
        try:
            date_obj = datetime.fromisoformat(published_at.replace('Z', '+00:00'))
            date_display = date_obj.strftime("%d/%m/%Y")
        except:
            date_display = published_at[:10]
    
    # Create card UI with consistent styling
    st.markdown(
        f"""
        <div style="border: 1px solid #ddd; border-left: 5px solid #28a745; 
                    padding: 10px; border-radius: 5px; margin-bottom: 10px; 
                    background-color: white;">
            <div style="font-weight: bold; margin-bottom: 8px;">{title[:50]}{'...' if len(title) > 50 else ''}</div>
            <div style="color: #666; font-size: 0.8em;">
                Published: {date_display}
            </div>
        </div>
        """, 
        unsafe_allow_html=True
    )

def get_stage_color(stage):
    """Returns a color code based on the article stage"""
    if stage == "pending":
        return "#ffc107"  # Yellow
    elif stage == "translated":
        return "#17a2b8"  # Blue
    else:
        return "#28a745"  # Green