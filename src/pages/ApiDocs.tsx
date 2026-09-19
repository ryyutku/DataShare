import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { swaggerSpec } from './swaggerSpec';

export const ApiDocs: React.FC = () => {
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>
            DataShare API Documentation (Swagger UI)
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Interactive testing playground for your live Supabase PostgreSQL REST endpoints.
          </p>
        </header>

        <SwaggerUI
          spec={swaggerSpec}
          requestInterceptor={(req) => {
            // Automatically injects your anon key into every "Try it out" test!
            req.headers['apikey'] = anonKey;
            req.headers['Authorization'] = `Bearer ${anonKey}`;
            return req;
          }}
        />
      </div>
    </div>
  );
};