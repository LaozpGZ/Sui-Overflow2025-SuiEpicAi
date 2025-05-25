import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CopyButton from "./CopyButton";
import { motion, AnimatePresence } from "framer-motion";

interface AgentProfileCardProps {
  name: string;
  address: string;
  bio: string;
  avatarUrl?: string;
  inviteUrl?: string;
}

const MAX_BIO_PREVIEW = 80;

const AgentProfileCard: React.FC<AgentProfileCardProps> = ({
  name,
  address,
  bio,
  avatarUrl,
  inviteUrl,
}) => {
  // 展开/收起简介
  const [bioExpanded, setBioExpanded] = useState(false);
  const shortBio = bio && bio.length > MAX_BIO_PREVIEW ? bio.slice(0, MAX_BIO_PREVIEW) + '...' : bio;

  return (
    <div className="relative flex flex-col items-center w-full">
      {/* 顶部渐变Banner */}
      <div className="w-full h-32 md:h-36 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-t-2xl relative flex items-end justify-center">
        {/* 头像悬浮于Banner上 */}
        <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 z-10 rounded-full p-1 bg-gradient-to-tr from-blue-300 via-blue-500 to-blue-700 shadow-xl">
          <Avatar className="h-20 w-20 border-4 border-white bg-white shadow-lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback className="text-lg">{name?.[0] || '?'}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
      {/* 卡片内容 */}
      <motion.div
        className="w-full bg-white rounded-b-2xl pt-14 pb-4 px-2 md:px-4 -mt-8"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex flex-col items-center">
          <Badge className="mb-2 bg-blue-600 text-white rounded-full px-4 py-1 text-base font-semibold shadow-md">AI Agent</Badge>
          <h2 className="text-3xl font-bold text-blue-900 mb-1 text-center drop-shadow">{name}</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-3">
          {/* 地址区块 */}
          <div className="flex-1 bg-blue-50/60 rounded-xl p-2 md:p-3 shadow-inner flex flex-col gap-2 items-start">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-5 w-5 text-blue-700" />
              <span className="text-base break-all text-blue-900 font-mono font-semibold">{address}</span>
              <CopyButton value={address} tooltip="Copy address" />
            </div>
          </div>
          {/* 邀请链接区块 */}
          {inviteUrl && (
            <div className="flex-1 bg-blue-50/60 rounded-xl p-2 md:p-3 shadow-inner flex flex-col gap-2 items-start">
              <h3 className="font-medium text-blue-900 mb-1">Invite URL</h3>
              <div className="flex items-center">
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline break-all block"
                >
                  {inviteUrl}
                </a>
                <CopyButton value={inviteUrl} tooltip="Copy invite URL" />
              </div>
            </div>
          )}
        </div>
        {/* Bio区块 */}
        <div className="mt-4">
          <h3 className="mb-2 font-medium text-blue-900">Bio</h3>
          <div className="bg-blue-50/60 rounded-lg p-4 text-sm text-blue-900 whitespace-pre-wrap shadow-inner">
            <AnimatePresence mode="wait">
              {bioExpanded ? (
                <motion.div
                  key="full-bio"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {bio}
                </motion.div>
              ) : (
                <motion.div
                  key="short-bio"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {shortBio}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {bio && bio.length > MAX_BIO_PREVIEW && (
            <div className="flex justify-center mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-700 rounded-full"
                onClick={() => setBioExpanded((v) => !v)}
              >
                {bioExpanded ? "Show Less" : "Show More"}
              </Button>
            </div>
          )}
        </div>
        <CardFooter className="flex justify-center gap-3 pt-8 bg-transparent">
          {/* 你可以在这里加更多操作按钮 */}
        </CardFooter>
      </motion.div>
    </div>
  );
};

export default AgentProfileCard; 