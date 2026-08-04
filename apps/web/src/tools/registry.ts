import type { LlmTool, LlmToolCall } from '@curio/core';
import { excalidrawModule } from '../mcp/excalidrawTools';
import type { ToolEffect, ToolModule } from './types';

/**
 * Every tool module Curio ships. Add a new capability by exporting a `ToolModule` and listing it
 * here — the chat loop picks up enabled modules automatically (no chat code changes).
 */
const MODULES: ToolModule[] = [excalidrawModule];

/** The modules enabled for the current turn. */
export function getToolModules(): ToolModule[] {
  return MODULES.filter((module) => module.enabled);
}

/** The combined list of tools across enabled modules, passed to the model. */
export function getEnabledTools(): LlmTool[] {
  return getToolModules().flatMap((module) => module.tools);
}

/** Extra system-prompt text for enabled modules, joined into one block. */
export function getToolsSystemPrompt(): string {
  return getToolModules()
    .map((module) => module.systemPrompt)
    .filter((prompt): prompt is string => Boolean(prompt))
    .join('\n\n');
}

/** Route a tool call to the module that declared it and run it. */
export function executeEnabledTool(call: LlmToolCall): Promise<string> {
  const module = getToolModules().find((candidate) =>
    candidate.tools.some((tool) => tool.name === call.name),
  );
  if (!module) {
    throw new Error(`Ningún módulo de tools registrado conoce "${call.name}".`);
  }
  return module.execute(call);
}

/** Collect visual effects produced by enabled modules during the last turn. */
export function collectToolEffects(): ToolEffect[] {
  return getToolModules()
    .map((module) => module.collectEffect())
    .filter((effect): effect is ToolEffect => effect !== null);
}
