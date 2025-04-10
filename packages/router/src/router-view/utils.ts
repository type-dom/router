// import { getCurrentInstance } from '@type-dom/framework';
// import { warn } from '../warning';

import { ISlotRaw } from '@type-dom/framework';
import { isFunction } from '@type-dom/utils';

export function normalizeSlot(slot: ISlotRaw | ((...args: any[]) => ISlotRaw) | undefined, data: any): ISlotRaw {
  if (!slot) return undefined;
  const slotContent = isFunction(slot) ? slot(data) : slot;
  // return slotContent.length === 1 ? slotContent[0] : slotContent
  return slotContent;
}

// warn against deprecated usage with <transition> & <keep-alive>
// due to functional component being no longer eager in Vue 3
// export function warnDeprecatedUsage() {
//   const instance = getCurrentInstance()!
//   const parentName = instance.parent && instance.parent.className
//   const parentSubTreeType =
//     instance.parent
//   if (
//     parentName &&
//     (parentName === 'KeepAlive' || parentName.includes('Transition')) &&
//     typeof parentSubTreeType === 'object' &&
//     parentSubTreeType.className === 'RouterView'
//   ) {
//     const comp = parentName === 'KeepAlive' ? 'keep-alive' : 'transition'
//     warn(
//       `<router-view> can no longer be used directly inside <transition> or <keep-alive>.\n` +
//         `Use slot props instead:\n\n` +
//         `<router-view v-slot="{ Component }">\n` +
//         `  <${comp}>\n` +
//         `    <component :is="Component" />\n` +
//         `  </${comp}>\n` +
//         `</router-view>`
//     )
//   }
// }