import React from 'react';
import { Link } from 'react-router-dom';

export const LivroMagias = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#05040a', color: '#d4af37', fontFamily: 'Cinzel, serif' }}>
      <h1>Livro de Magias</h1>
      <p style={{ color: '#8a7d9b', marginTop: '10px' }}>[LIVRO DE MAGIAS] - Em Fase de Forja Arcana (Desenvolvimento)</p>
      <Link to="/" style={{ marginTop: '20px', color: '#1dd1a1', textDecoration: 'none', border: '1px solid #1dd1a1', padding: '10px 20px', borderRadius: '4px' }}>Voltar ao Hub</Link>
    </div>
  );
};
