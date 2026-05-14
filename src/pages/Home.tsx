import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  const menuItems = [
    { name: 'Magias Lógicas (Codex)', path: '/codex', desc: 'Forge suas magias com a precisão dos círculos rúnicos.', icon: '✧' },
    { name: 'Magias Naturalistas', path: '/naturalista', desc: 'Dicionário de palavras de poder e canalização livre.', icon: '🌿' },
    { name: 'Livro de Magias', path: '/livro-magias', desc: 'Acesse tomos e magias prontas da comunidade.', icon: '📖' },
    { name: 'Livro de Monstros', path: '/livro-monstros', desc: 'Consulte o bestiário e táticas de combate.', icon: '🐉' },
    { name: 'Criação de Fichas', path: '/fichas', desc: 'Gere a essência de seu personagem.', icon: '👤' },
    { name: 'Criação de Mundos', path: '/criarmundo', desc: 'Forje seus próprios reinos e campanhas.', icon: '🌍' },
  ];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', 
      background: '#05040a', color: '#eaeaea', fontFamily: 'Cinzel, serif', padding: '40px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ color: '#d4af37', fontSize: '3rem', letterSpacing: '4px', textTransform: 'uppercase', textShadow: '0 0 20px rgba(212,175,55,0.3)', margin: '0 0 10px 0' }}>Codex Arcana</h1>
        <p style={{ color: '#8a7d9b', fontSize: '1.2rem', fontStyle: 'italic', letterSpacing: '1px' }}>O Compêndio Definitivo de Manipulação Etérea</p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', width: '100%', maxWidth: '1000px'
      }}>
        {menuItems.map((item, idx) => (
          <Link to={item.path} key={idx} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'linear-gradient(145deg, rgba(20,16,28,0.8) 0%, rgba(10,8,15,0.9) 100%)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '12px',
              padding: '25px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(212,175,55,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.4)';
            }}
            >
              <div style={{ fontSize: '2.5rem', color: '#1dd1a1', marginBottom: '15px' }}>{item.icon}</div>
              <h2 style={{ color: '#d4af37', fontSize: '1.3rem', margin: '0 0 10px 0', textTransform: 'uppercase' }}>{item.name}</h2>
              <p style={{ color: '#8a7d9b', fontSize: '0.9rem', lineHeight: '1.5', margin: 0, fontFamily: 'custom-sans, sans-serif' }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
