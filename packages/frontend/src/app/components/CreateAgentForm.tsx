'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, TextField, TextArea, Spinner, Callout } from '@radix-ui/themes';
import { useCurrentAccount } from '@mysten/dapp-kit';
import CustomConnectButton from './CustomConnectButton';
import { useDebounce } from '@/hooks/useDebounce';
import { API_CONFIG } from '@/config/api';
import { AI_FRAME_CONFIG } from '@/app/config/config';
import { WEB3_CONFIG } from '@/app/config/api';

// Loading spinner component
const Loading = () => (
  <div className="flex justify-center items-center py-8">
    <Spinner size="3" />
  </div>
);

export default function CreateAgentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramGroupId, setTelegramGroupId] = useState('');
  const [agentBio, setAgentBio] = useState('');
  const [telegramInviteUrl, setTelegramInviteUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [agentImage, setAgentImage] = useState('');
  const debouncedName = useDebounce(agentName, 500);
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const isWalletConnected = !!walletAddress;

  // Check if agent name already exists
  useEffect(() => {
    const checkAgentNameExists = async () => {
      if (!debouncedName || debouncedName.trim() === '') return;
      setIsChecking(true);
      try {
        const response = await fetch(`${API_CONFIG.SERVER_API}/agents/${debouncedName}`);
        const data = await response.json();
        setNameExists(data.agent !== null);
      } catch {
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
    setIsLoading(true);
    try {
      // If wallet is not connected
      if (!isWalletConnected) {
        setIsLoading(false);
        return;
      }
      // Step 1: Add Telegram bot
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
          image: agentImage,
        }),
      });
      if (!addTelegramBotResponse.ok) throw new Error(`Failed to add Telegram bot: ${addTelegramBotResponse.status} ${addTelegramBotResponse.statusText}`);
      // Get agentId from response
      const addTelegramBotData = await addTelegramBotResponse.json();
      const agentId = addTelegramBotData.agentId || addTelegramBotData.id || addTelegramBotData.agent_id;
      if (!agentId) throw new Error('Failed to get agentId');
      // Construct agentData
      const agentData = {
        name: agentName,
        clients: ["telegram"],
        allowDirectMessages: true,
        modelProvider: "deepseek",
        settings: {
          secrets: {
            TELEGRAM_BOT_TOKEN: telegramToken,
            NEW_MEMBER_VERIFY_URL: WEB3_CONFIG.NEW_MEMBER_VERIFY_URL
          },
          modelConfig: {
            maxOutputTokens: 4096
          }
        },
        plugins: ["@elizaos-plugins/client-telegram"],
        bio: [agentBio],
        lore: [],
        knowledge: [
          "I can execute token transfers, staking, unstaking, and governance actions directly with the connected wallet.",
          "I ensure all actions are verified and secure before execution.",
          "I support creating new denominations (denoms) directly through your wallet."
        ],
        messageExamples: [],
        postExamples: [],
        topics: [
          "Direct wallet operations",
          "Token management",
          "Secure transaction execution"
        ],
        style: {
          all: [
            "Direct",
            "Precise",
            "Factual",
            "Data-driven"
          ],
          chat: [
            "Clear",
            "Verification-focused",
            "Data-driven"
          ],
          post: []
        },
        adjectives: [
          "Accurate",
          "Methodical",
          "Wallet-integrated"
        ]
      };
      // Step 2: Set agent details
      const setResponse = await fetch(`${AI_FRAME_CONFIG.AI_FRAME_API}/agents/${agentId}/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      if (!setResponse.ok) {
        throw new Error(`Failed to create agent: ${setResponse.status} ${setResponse.statusText}`);
      }
      // Success feedback
      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch {
      // You can add error handling here
    }
    setIsLoading(false);
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
      {/* Wallet info (optional) */}
      <div className="mb-4 text-sm text-gray-500">Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</div>
      {/* Basic Info Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sds-blue to-sds-pink bg-clip-text text-transparent">
          Agent Basic Info
        </h2>
        <div className="mb-6">
          <label htmlFor="agentName" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Agent Name
          </label>
          <TextField.Root
            id="agentName"
            name="agentName"
            placeholder="Agent Name"
            value={agentName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgentName(e.target.value)}
            required
            color={nameExists ? 'red' : undefined}
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          {isChecking && <div className="text-xs text-gray-500 mt-1">Checking availability...</div>}
          {nameExists && <div className="text-xs text-red-500 mt-1">This agent name already exists. Please choose another name.</div>}
        </div>
        <div className="mb-6">
          <label htmlFor="agentBio" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Agent Bio
          </label>
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
        </div>
        <div className="mb-6">
          <label htmlFor="agentImage" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Agent Image URL
          </label>
          <TextField.Root
            id="agentImage"
            name="agentImage"
            placeholder="Agent Image URL"
            value={agentImage}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgentImage(e.target.value)}
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">Optional: Enter an image URL for the agent avatar</div>
        </div>
      </div>
      {/* Telegram Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-sds-pink to-sds-blue bg-clip-text text-transparent">
          Telegram Configuration
        </h2>
        <div className="mb-6">
          <label htmlFor="telegramToken" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Telegram Bot Token
          </label>
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
        </div>
        <div className="mb-6">
          <label htmlFor="telegramGroupId" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Telegram Group ID
          </label>
          <TextField.Root
            id="telegramGroupId"
            name="telegramGroupId"
            placeholder="Telegram Group ID (negative number)"
            value={telegramGroupId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelegramGroupId(e.target.value)}
            required
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">Must be a negative number (e.g., -1001234567890)</div>
        </div>
        <div className="mb-6">
          <label htmlFor="telegramInviteUrl" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            Telegram Invite URL
          </label>
          <TextField.Root
            id="telegramInviteUrl"
            name="telegramInviteUrl"
            placeholder="https://t.me/+7Ev9E8aomwk5YzI1"
            value={telegramInviteUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelegramInviteUrl(e.target.value)}
            required
            size="3"
            className="rounded-lg shadow-sm focus:ring-2 focus:ring-sds-blue transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">Must be a valid Telegram invite URL (e.g., https://t.me/+7Ev9E8aomwk5YzI1)</div>
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
          disabled={!isWalletConnected || isLoading}
          className="rounded-lg bg-gradient-to-r from-sds-blue to-sds-pink text-white font-semibold shadow-md transition-all hover:scale-105 hover:from-sds-pink hover:to-sds-blue"
        >
          {isLoading ? 'Creating...' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );
} 