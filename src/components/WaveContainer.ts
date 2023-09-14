import type { DefineComponent } from "vue";
import { defineComponent } from "vue";

export const WaveContainer = defineComponent({
  name: "WaveContainer",
  setup(_, { slots }) {
    return () => {
      return [slots.default?.()];
    };
  },
}) as DefineComponent<Record<string, any>>;
