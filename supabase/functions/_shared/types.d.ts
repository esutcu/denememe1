// Type declarations for Supabase Edge Functions (Deno environment)

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

// Global fetch is available in Deno
declare const fetch: typeof globalThis.fetch;

// Additional Deno globals that might be needed
declare const console: Console;
declare const Date: DateConstructor;
declare const Response: typeof globalThis.Response;
declare const Request: typeof globalThis.Request;
declare const Headers: typeof globalThis.Headers;

// Deno standard library type declarations
declare module 'https://deno.land/std@0.208.0/http/server.ts' {
  export function serve(handler: (req: Request) => Response | Promise<Response>): void;
}

// Supabase client type declarations
declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface QueryBuilder extends Promise<{ data: any; error: any }> {
    select(columns?: string): QueryBuilder;
    insert(data: any): QueryBuilder;
    update(data: any): QueryBuilder;
    delete(): QueryBuilder;
    eq(column: string, value: any): QueryBuilder;
    gt(column: string, value: any): QueryBuilder;
    order(column: string, options?: { ascending: boolean }): QueryBuilder;
    limit(count: number): QueryBuilder;
    single(): QueryBuilder;
  }

  export interface AuthResponse {
    data: { user: any };
    error: any;
  }

  export interface SupabaseClient {
    auth: {
      getUser(token: string): Promise<AuthResponse>;
    };
    from(table: string): QueryBuilder;
  }
  
  export function createClient(url: string, key: string): SupabaseClient;
}