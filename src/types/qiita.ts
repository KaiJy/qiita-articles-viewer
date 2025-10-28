export interface QiitaUser {
    id: string;
    name: string;
    description: string;
    facebook_id: string;
    followees_count: number;
    followers_count: number;
    github_login_name: string;
    items_count: number;
    linkedin_id: string;
    location: string;
    organization: string;
    permanent_id: number;
    profile_image_url: string;
    team_only: boolean;
    twitter_screen_name: string;
    website_url: string;
  }
  
  export interface QiitaTag {
    name: string;
    versions: string[];
  }
  
  export interface QiitaItem {
    id: string;
    title: string;
    url: string;
    user: QiitaUser;
    tags: QiitaTag[];
    created_at: string;
    updated_at: string;
    body: string;
    rendered_body: string;
    private: boolean;
    reactions_count: number;
    comments_count: number;
    likes_count: number;
    stocks_count: number;
    page_views_count: number;
    team_membership: unknown;
    coediting: boolean;
    group: unknown;
  }
  
  export interface QiitaApiResponse {
    items: QiitaItem[];
    total_count: number;
    page: number;
    per_page: number;
  }
  