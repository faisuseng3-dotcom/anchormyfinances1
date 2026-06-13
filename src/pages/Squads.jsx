import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import SquadsHub from '@/components/dashboard/copilot/tools/SquadsHub';

export default function Squads() {
  return <SquadsHub />;
}

export const pageSeo = pageSeoFor('Squads');
