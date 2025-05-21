'use client';

import React, { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_SERVER_API || 'https://38.54.24.5/api';

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 示例参数
  const testUser = '0x1234567890abcdef';
  const testChain = 'sui';
  const testAgentName = 'test-agent';

  // 1. 签名验证
  const verifySignature = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify-signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge: 'test-challenge',
          chat_id: 'test-chat',
          signature: 'test-signature',
          user: testUser,
          chain_type: testChain,
        }),
      });
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e + '' });
    }
    setLoading(false);
  };

  // 2. 获取代理列表
  const getAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agents?page=1&page_size=5`);
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e + '' });
    }
    setLoading(false);
  };

  // 3. 获取单个代理信息
  const getAgentByName = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agents/${testAgentName}`);
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e + '' });
    }
    setLoading(false);
  };

  // 4. 获取代理详情
  const getAgentDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/detail/${testAgentName}`);
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e + '' });
    }
    setLoading(false);
  };

  // 5. 获取用户份额
  const getUserShares = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/users/${testUser}/shares/${testChain}`);
      setResult(await res.json());
    } catch (e) {
      setResult({ error: e + '' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>API Test Page</h1>
      <div style={{ margin: '16px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button onClick={verifySignature} disabled={loading}>Verify Signature</button>
        <button onClick={getAgents} disabled={loading}>Get Agent List</button>
        <button onClick={getAgentByName} disabled={loading}>Get Agent By Name</button>
        <button onClick={getAgentDetail} disabled={loading}>Get Agent Detail</button>
        <button onClick={getUserShares} disabled={loading}>Get User Shares</button>
      </div>
      <pre style={{ background: '#222', color: '#fff', padding: 16, borderRadius: 8, minHeight: 200 }}>
        {loading ? 'Loading...' : JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
