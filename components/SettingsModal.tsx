import React from 'react';
import type { Settings, Theme, ErrorCheckMode, Language } from '../types';
import { SunIcon, MoonIcon, HomeIcon, SoundOnIcon, SoundOffIcon, VibrateIcon, InstantCheckIcon, NoCheckIcon, CheckCircleIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  t: (key: string, ...args: any[]) => string;
}

const ModalWrapper: React.FC<{ children: React.ReactNode, onClose: () => void }> = ({ children, onClose }) => (
  <div 
    className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in"
    onClick={onClose}
  >
    <div 
      className="bg-surface-light dark:bg-surface-dark border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl shadow-brand-dark/20 dark:shadow-black/30 p-6 sm:p-8 text-text-light dark:text-text-dark max-w-md w-full animate-jelly-in"
      onClick={(e) => e.stopPropagation()}
      style={{'--ease-spring': 'cubic-bezier(0.5, 1.5, 0.5, 1)'} as React.CSSProperties}
    >
      {children}
    </div>
  </div>
);

const SettingRow: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="flex items-center justify-between py-4 border-b border-brand-dark/10 dark:border-brand-light/10">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="w-1/2 max-w-[200px]">{children}</div>
    </div>
);

const ToggleButton: React.FC<{
    options: { value: string | boolean; label: React.ReactNode }[];
    currentValue: string | boolean;
    onChange: (value: any) => void;
}> = ({ options, currentValue, onChange }) => {
    const activeIndex = options.findIndex(opt => opt.value === currentValue);
    const itemWidthPercent = 100 / options.length;

    return (
        <div className="relative flex w-full bg-brand-dark/10 dark:bg-brand-dark/80 rounded-full p-1">
            <div
                className="absolute top-1 bottom-1 bg-white dark:bg-accent rounded-full shadow-md"
                style={{
                    width: `calc(${itemWidthPercent}% - 4px)`, // p-1 is 4px total, so subtract from width
                    left: `calc(${activeIndex * itemWidthPercent}% + 2px)`, // and add half for position
                    transition: 'left 0.4s cubic-bezier(0.5, 1.5, 0.5, 1)',
                }}
            />
            {options.map(opt => (
                <button
                    key={String(opt.value)}
                    onClick={() => onChange(opt.value)}
                    className="relative z-10 flex-1 py-1.5 text-sm font-bold rounded-full transition-colors flex items-center justify-center"
                >
                    <span className={currentValue === opt.value ? 'text-accent dark:text-white' : 'text-text-muted-light dark:text-text-muted-dark'}>
                        {opt.label}
                    </span>
                </button>
            ))}
        </div>
    );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, t }) => {
  if (!isOpen) return null;

  return (
    <ModalWrapper onClose={onClose}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-4xl font-black tracking-tight">{t('settings')}</h2>
        <button onClick={onClose} className="p-3 rounded-full transition-colors hover:bg-accent/10 dark:hover:bg-accent/20 text-text-muted-light dark:text-text-muted-dark hover:text-accent dark:hover:text-secondary">
            <HomeIcon className="w-8 h-8" />
        </button>
      </div>

      <div className="space-y-2">
        <SettingRow title={t('theme')}>
            <ToggleButton
                options={[
                    { value: 'light', label: <SunIcon className="w-5 h-5"/> },
                    { value: 'dark', label: <MoonIcon className="w-5 h-5"/> },
                ]}
                currentValue={settings.theme}
                onChange={(value: Theme) => onSettingsChange({ theme: value })}
            />
        </SettingRow>
        
        <SettingRow title={t('feedback')}>
            <ToggleButton
                options={[
                    { value: 'sound', label: <span title={t('sound')}><SoundOnIcon className="w-5 h-5"/></span> },
                    { value: 'vibrate', label: <span title={t('vibrate')}><VibrateIcon className="w-5 h-5"/></span> },
                    { value: 'mute', label: <span title={t('mute')}><SoundOffIcon className="w-5 h-5"/></span> },
                ]}
                currentValue={settings.soundMode}
                onChange={(value: 'sound' | 'vibrate' | 'mute') => onSettingsChange({ soundMode: value })}
            />
        </SettingRow>

        <div>
            <SettingRow title={t('errorCheckMode')}>
                <ToggleButton
                    options={[
                        { value: 'instant', label: <span title={t('instant')}><InstantCheckIcon className="w-5 h-5"/></span> },
                        { value: 'manual', label: <span title={t('manual')}><CheckCircleIcon className="w-5 h-5"/></span> },
                        { value: 'off', label: <span title={t('off')}><NoCheckIcon className="w-5 h-5"/></span> },
                    ]}
                    currentValue={settings.errorCheckMode}
                    onChange={(value: ErrorCheckMode) => onSettingsChange({ errorCheckMode: value })}
                />
            </SettingRow>
             <div className="text-center px-2 pt-2 h-16">
                <p key={settings.errorCheckMode} className="text-sm text-text-muted-light dark:text-text-muted-dark animate-fade-in-down">
                    {t(`${settings.errorCheckMode}Desc`)}
                </p>
            </div>
        </div>
        
        <SettingRow title={t('language')}>
             <ToggleButton
                options={[
                    { value: 'en', label: "EN" },
                    { value: 'it', label: "IT" },
                ]}
                currentValue={settings.language}
                onChange={(value: Language) => onSettingsChange({ language: value })}
            />
        </SettingRow>
      </div>
      
      <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-8 text-center">{t('settingsSaved')}</p>
    </ModalWrapper>
  );
};