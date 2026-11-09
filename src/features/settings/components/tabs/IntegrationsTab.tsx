'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  LuFolderGit2,
  LuMessageSquare,
  LuFigma,
  LuCalendar,
  LuTrello,
  LuWebhook,
} from 'react-icons/lu';
import { IntegrationService } from '../../types/settings.types';
import { settingsStorage, DEFAULT_INTEGRATIONS } from '../../utils/settingsStorage';

export function IntegrationsTab() {
  const [integrations, setIntegrations] = useState<IntegrationService[]>(
    () => settingsStorage.getIntegrations() || DEFAULT_INTEGRATIONS
  );

  const toggleConnection = (id: string) => {
    const updated = integrations.map((item) => {
      if (item.id === id) {
        const nextState = !item.connected;
        toast.info(
          nextState
            ? `Connected to ${item.name}`
            : `Disconnected ${item.name}`
        );
        return { ...item, connected: nextState };
      }
      return item;
    });

    setIntegrations(updated);
    settingsStorage.saveIntegrations(updated);
  };

  const getIcon = (id: string) => {
    switch (id) {
      case 'github':
        return <LuFolderGit2 className="w-5 h-5 text-neutral-900" />;
      case 'slack':
        return <LuMessageSquare className="w-5 h-5 text-emerald-700" />;
      case 'figma':
        return <LuFigma className="w-5 h-5 text-rose-600" />;
      case 'gcal':
        return <LuCalendar className="w-5 h-5 text-blue-700" />;
      case 'jira':
        return <LuTrello className="w-5 h-5 text-sky-700" />;
      case 'webhooks':
        return <LuWebhook className="w-5 h-5 text-amber-700" />;
      default:
        return <LuFolderGit2 className="w-5 h-5 text-primary-dark" />;
    }
  };

  return (
    <div className="font-elms space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-primary-dark">
          Connected Integrations
        </h2>
        <p className="text-xs sm:text-sm text-primary-dark/80 font-medium mt-1 leading-relaxed">
          Link NexaFlow with your engineering repositories, design assets, and communications channels.
        </p>
      </div>

      <div className="border-b border-primary-medium/15 my-6" />

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {integrations.map((item) => {
          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                item.connected
                  ? 'border-primary-medium/25 bg-white shadow-2xs'
                  : 'border-primary-medium/15 bg-white/50 opacity-85 hover:opacity-100'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-surface/60 flex items-center justify-center shrink-0 border border-primary-medium/20">
                    {getIcon(item.id)}
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      item.connected
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-300'
                    }`}
                  >
                    {item.connected ? 'Connected' : 'Not Connected'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-primary-dark">
                  {item.name}
                </h3>
                <p className="text-[11px] font-bold text-primary-dark/70 mt-0.5">
                  {item.category}
                </p>
                <p className="text-xs text-primary-dark/80 font-medium mt-2 leading-relaxed">
                  {item.description}
                </p>

                {item.meta && item.connected && (
                  <p className="text-[11px] font-bold text-emerald-800 mt-2">
                    ✓ {item.meta}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-primary-medium/15 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleConnection(item.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    item.connected
                      ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                      : 'bg-primary-dark hover:bg-primary text-white shadow-2xs'
                  }`}
                >
                  {item.connected ? 'Disconnect' : 'Connect Account'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
