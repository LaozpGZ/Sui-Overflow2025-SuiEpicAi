'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, TextField, TextArea, Spinner, Callout } from '@radix-ui/themes';
import { useCurrentAccount } from '@mysten/dapp-kit';
import CustomConnectButton from './CustomConnectButton';
import { useDebounce } from '@/hooks/useDebounce';
import { AI_FRAME_CONFIG, API_CONFIG, WEB3_CONFIG } from '@/config/api';
import { z } from 'zod';

// Error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <Callout.Root color="red" className="mb-4">
    <Callout.Text>{message}</Callout.Text>
  </Callout.Root>
);

// Loading spinner component
const Loading = () => (
  <div className="flex justify-center items-center py-8">
    <Spinner size="3" />
  </div>
);

// Wallet connection prompt component
const WalletConnectSection = ({ isWalletConnected, walletAddress, connectWallet }: any) => (
  <div className="bg-gray-100 p-4 rounded-md mb-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium">Wallet Connection</h3>
        <p className="text-xs text-gray-500">
          {isWalletConnected
            ? `Connected: ${walletAddress?.substring(0, 6)}...${walletAddress?.substring(walletAddress.length - 4)}`
            : 'Please connect your wallet to create an agent'}
        </p>
      </div>
      {!isWalletConnected && (
        <Button onClick={connectWallet} size="2" variant="solid">
          Connect Wallet
        </Button>
      )}
    </div>
  </div>
);

// Define form validation schema
const agentFormSchema = z.object({
  agentName: z.string().min(1, 'Agent name is required'),
  telegramToken: z.string().min(1, 'Telegram Bot Token is required'),
  telegramGroupId: z.string().regex(/^\-\d+$/, 'Invalid group ID format'),
  agentBio: z.string().min(1, 'Agent bio is required'),
  telegramInviteUrl: z.string().regex(/^https:\/\/t\.me\/\+[a-zA-Z0-9_-]+$/, 'Invalid Telegram invite URL'),
});

export default function CreateAgentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agentName, setAgentName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramGroupId, setTelegramGroupId] = useState('');
  const [agentBio, setAgentBio] = useState('');
  const [telegramInviteUrl, setTelegramInviteUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const debouncedName = useDebounce(agentName, 500);
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const isWalletConnected = !!walletAddress;

  // Validation logic
  const telegramInviteUrlRegex = /^https:\/\/t\.me\/\+[a-zA-Z0-9_-]+$/;
  const isTelegramUrlValid = telegramInviteUrlRegex.test(telegramInviteUrl);
  const isGroupIdValid = /^-\d+$/.test(telegramGroupId);
  const formValidation = agentFormSchema.safeParse({
    agentName,
    telegramToken,
    telegramGroupId,
    agentBio,
    telegramInviteUrl,
  });
  const isFormValid = formValidation.success && !nameExists && isWalletConnected;
  const zodErrors = formValidation.success ? {} : formValidation.error.formErrors.fieldErrors;

  // Check if agent name already exists
  useEffect(() => {
    const checkAgentNameExists = async () => {
      if (!debouncedName || debouncedName.trim() === '') return;
      setIsChecking(true);
      try {
        const response = await fetch(`${API_CONFIG.SERVER_API}/agents/${debouncedName}`);
        const data = await response.json();
        setNameExists(data.agent !== null);
      } catch (error) {
        // 网络错误不阻断流程
        setNameExists(false);
      } finally {
        setIsChecking(false);
      }
    };
    checkAgentNameExists();
  }, [debouncedName]);

  // Form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // 钱包未连接
      if (!isWalletConnected) {
        setError('Please connect your wallet first');
        setIsLoading(false);
        return;
      }
      // Validation
      if (!isFormValid) {
        setError('Please fill all fields correctly');
        setIsLoading(false);
        return;
      }
      // 获取agentId
      const idResponse = await fetch(`${AI_FRAME_CONFIG.AI_FRAME_API}/agent/id/${encodeURIComponent(agentName)}`);
      if (!idResponse.ok) throw new Error(`Failed to get agent ID: ${idResponse.status} ${idResponse.statusText}`);
      const { agentId } = await idResponse.json();
      if (!agentId) throw new Error('No agent ID returned from server');
      // 生成agent数据
      const agentData = {
        name: agentName,
        clients: ['telegram'],
        allowDirectMessages: true,
        modelProvider: 'deepseek',
        settings: {
          secrets: {
            TELEGRAM_BOT_TOKEN: telegramToken,
            NEW_MEMBER_VERIFY_URL: WEB3_CONFIG.NEW_MEMBER_VERIFY_URL,
          },
          modelConfig: { maxOutputTokens: 4096 },
        },
        plugins: ['@elizaos-plugins/client-telegram'],
        bio: [agentBio],
        lore: [],
        knowledge: [
          'I can execute token transfers, staking, unstaking, and governance actions directly with the connected wallet.',
          'I ensure all actions are verified and secure before execution.',
          'I support creating new denominations (denoms) directly through your wallet.',
        ],
        messageExamples: [],
        postExamples: [],
        topics: [
          'Direct wallet operations',
          'Token management',
          'Secure transaction execution',
        ],
        style: {
          all: ['Direct', 'Precise', 'Factual', 'Data-driven'],
          chat: ['Clear', 'Verification-focused', 'Data-driven'],
          post: [],
        },
        adjectives: ['Accurate', 'Methodical', 'Wallet-integrated'],
      };
      // 设置agent数据
      const setResponse = await fetch(`${AI_FRAME_CONFIG.AI_FRAME_API}/agents/${agentId}/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      if (!setResponse.ok) throw new Error(`Failed to create agent: ${setResponse.status} ${setResponse.statusText}`);
      // 添加Telegram bot
      const addTelegramBotResponse = await fetch(`${API_CONFIG.SERVER_API}/add_tg_bot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_token: telegramToken,
          chat_group_id: telegramGroupId,
          subject_address: walletAddress,
          agent_name: agentName,
          bio: agentBio,
          invite_url: telegramInviteUrl,
        }),
      });
      if (!addTelegramBotResponse.ok) throw new Error(`Failed to add Telegram bot: ${addTelegramBotResponse.status} ${addTelegramBotResponse.statusText}`);
      // 成功反馈
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Show connect button if wallet is not connected
  if (!isWalletConnected) {
    return <CustomConnectButton />;
  }

  // Loading animation
  if (isLoading) {
    return <Loading />;
  }

  // Success toast
  if (success) {
    return (
      <Callout.Root color="green" className="mb-8 mt-8 text-lg flex items-center justify-center">
        <Callout.Icon />
        <Callout.Text>Agent created successfully! Redirecting...</Callout.Text>
      </Callout.Root>
    );
  }

  return (
    <form
      className="space-y-8 max-w-xl mx-auto p-8 rounded-2xl mt-8 mb-8"
      onSubmit={handleSubmit}
    >
      <h1 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-sds-blue to-sds-pink bg-clip-text text-transparent">
        Create Agent
      </h1>
      {error && (
        <Callout.Root color="red" className="mb-6 flex items-center">
          <Callout.Icon />
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      {/* Wallet info (optional) */}
      <div className="mb-4 text-sm text-gray-500">Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</div>
      {/* Basic Info Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Agent Basic Info</h2>
        <div className="mb-6">
          <TextField.Root
            id="agentName"
            name="agentName"
            placeholder="Agent Name"
            value={agentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value)}
            required
            color={nameExists || zodErrors.agentName ? 'red' : undefined}
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          {isChecking && <div className="text-xs text-gray-500 mt-1">Checking availability...</div>}
          {nameExists && <div className="text-xs text-red-500 mt-1">This agent name already exists. Please choose another name.</div>}
          {zodErrors.agentName && <div className="text-xs text-red-500 mt-1">{zodErrors.agentName[0]}</div>}
        </div>
        <div className="mb-6">
          <TextArea
            id="agentBio"
            name="agentBio"
            placeholder="Enter agent bio"
            value={agentBio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAgentBio(e.target.value)}
            required
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          {zodErrors.agentBio && <div className="text-xs text-red-500 mt-1">{zodErrors.agentBio[0]}</div>}
        </div>
      </div>
      {/* Telegram Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Telegram Configuration</h2>
        <div className="mb-6">
          <TextField.Root
            id="telegramToken"
            name="telegramToken"
            placeholder="Telegram Bot Token"
            value={telegramToken}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelegramToken(e.target.value)}
            required
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          {zodErrors.telegramToken && <div className="text-xs text-red-500 mt-1">{zodErrors.telegramToken[0]}</div>}
        </div>
        <div className="mb-6">
          <TextField.Root
            id="telegramGroupId"
            name="telegramGroupId"
            placeholder="Telegram Group ID (negative number)"
            value={telegramGroupId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelegramGroupId(e.target.value)}
            required
            color={zodErrors.telegramGroupId ? 'red' : undefined}
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">Must be a negative number (e.g., -1001234567890)</div>
          {zodErrors.telegramGroupId && <div className="text-xs text-red-500 mt-1">{zodErrors.telegramGroupId[0]}</div>}
        </div>
        <div className="mb-6">
          <TextField.Root
            id="telegramInviteUrl"
            name="telegramInviteUrl"
            placeholder="https://t.me/+7Ev9E8aomwk5YzI1"
            value={telegramInviteUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelegramInviteUrl(e.target.value)}
            required
            color={zodErrors.telegramInviteUrl ? 'red' : undefined}
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">Must be a valid Telegram invite URL (e.g., https://t.me/+7Ev9E8aomwk5YzI1)</div>
          {zodErrors.telegramInviteUrl && <div className="text-xs text-red-500 mt-1">{zodErrors.telegramInviteUrl[0]}</div>}
        </div>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
        <Link href="/">
          <Button
            type="button"
            variant="outline"
            color="gray"
            size="3"
            className="rounded-lg transition-all hover:scale-105"
          >
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          variant="solid"
          size="3"
          disabled={!isFormValid || isLoading}
          className="rounded-lg bg-gradient-to-r from-sds-blue to-sds-pink text-white font-semibold shadow-md transition-all hover:scale-105 hover:from-sds-pink hover:to-sds-blue"
        >
          {isLoading ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
} 