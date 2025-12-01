import React, { useState } from 'react';
import { brokerAPI } from '../services/api';

function TestPage() {
  const [testResult, setTestResult] = useState(null);
  const [productsResult, setProductsResult] = useState(null);
  const [inquiryTestResult, setInquiryTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await brokerAPI.test();
      setTestResult(result);
      console.log('✅ Test result:', result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
      console.error('❌ Test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkProducts = async () => {
    setLoading(true);
    try {
      const result = await brokerAPI.listProducts();
      setProductsResult(result);
      console.log('✅ Products result:', result);
    } catch (error) {
      setProductsResult({ success: false, error: error.message });
      console.error('❌ Products check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const testInquiryCreation = async () => {
    setLoading(true);
    try {
      const result = await brokerAPI.testInquiry();
      setInquiryTestResult(result);
      console.log('✅ Inquiry test result:', result);
    } catch (error) {
      setInquiryTestResult({ success: false, error: error.message });
      console.error('❌ Inquiry test failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 API Test Page</h1>
      <p>This page helps test if the broker API and database are working correctly.</p>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={runTest} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>

        <button 
          onClick={checkProducts} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Checking...' : 'Check Products'}
        </button>

        <button 
          onClick={testInquiryCreation} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Testing...' : 'Test Inquiry'}
        </button>
      </div>

      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px'
        }}>
          <h3>{testResult.success ? '✅ API Test Passed' : '❌ API Test Failed'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {productsResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: productsResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${productsResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px'
        }}>
          <h3>{productsResult.success ? '✅ Products Check Passed' : '❌ Products Check Failed'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(productsResult, null, 2)}
          </pre>
        </div>
      )}

      {inquiryTestResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: inquiryTestResult.success ? '#d4edda' : '#f8d7da',
          border: `1px solid ${inquiryTestResult.success ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '8px'
        }}>
          <h3>{inquiryTestResult.success ? '✅ Inquiry Test Passed' : '❌ Inquiry Test Failed'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>
            {JSON.stringify(inquiryTestResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default TestPage; 