'use client';

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import Loading from '@/app/components/Loading';
import ErrorMessage from '@/app/components/ErrorMessage';
import type { SharesBalanceResult } from '@/types/shares';

// Props for SharesTable
export type SharesTableProps = {
  userShares: { subject: string; sharesAmount: SharesBalanceResult | null; loading: boolean; error: string | null }[];
  onSell: (subjectAddress: string, sharesAmount: string) => void;
};

function getDisplayAmount(sharesAmount: SharesBalanceResult | null): string {
  if (!sharesAmount) return '0';
  if (typeof sharesAmount === 'object' && 'balance' in sharesAmount) return sharesAmount.balance.toString();
  return '0';
}

const SharesTable: React.FC<SharesTableProps> = ({ userShares, onSell }) => {
  return (
    <Card className="border-blue-100 dark:border-blue-900 overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 border-b border-blue-100 dark:border-blue-900">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Your Shares Portfolio</h2>
          <p className="text-sm text-blue-700 dark:text-blue-300">Manage your stock investments</p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-blue-50/50 dark:bg-blue-950/50">
              <TableRow className="hover:bg-transparent">
                <TableHead>Subject</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userShares.map((share, idx) => (
                <TableRow key={share.subject + idx} className="border-b border-blue-50 dark:border-blue-900/50">
                  <TableCell className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {share.subject}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {share.loading ? <Loading /> : share.error ? <ErrorMessage message={share.error} /> : getDisplayAmount(share.sharesAmount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
                        onClick={() => onSell(share.subject, getDisplayAmount(share.sharesAmount))}
                        disabled={share.loading || !!share.error || !share.sharesAmount}
                      >
                        Sell
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SharesTable; 