import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";

import { CommonResendCodeAction } from "#components";

const UButtonStub = defineComponent({
  name: "UButton",
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "button",
    },
  },
  emits: ["click"],
  template:
    '<button :disabled="disabled" :type="type" @click="$emit(\'click\')"><slot /></button>',
});

describe("Common ResendCodeAction", () => {
  it("emits request when button is available", async () => {
    const wrapper = await mountSuspended(CommonResendCodeAction, {
      props: {
        secondsLeft: 0,
        canRequest: true,
      },
      global: {
        stubs: {
          UButton: UButtonStub,
        },
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Request another code");

    await button.trigger("click");
    expect(wrapper.emitted("request")).toHaveLength(1);
  });

  it("disables request button when request is not allowed", async () => {
    const wrapper = await mountSuspended(CommonResendCodeAction, {
      props: {
        secondsLeft: 0,
        canRequest: false,
      },
      global: {
        stubs: {
          UButton: UButtonStub,
        },
      },
    });

    const button = wrapper.find("button");
    expect(button.attributes("disabled")).toBeDefined();

    await button.trigger("click");
    expect(wrapper.emitted("request")).toBeUndefined();
  });

  it("shows countdown text during cooldown", async () => {
    const wrapper = await mountSuspended(CommonResendCodeAction, {
      props: {
        secondsLeft: 30,
        canRequest: true,
      },
      global: {
        stubs: {
          UButton: UButtonStub,
        },
      },
    });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toContain("Request another code in 0:30");
  });
});
