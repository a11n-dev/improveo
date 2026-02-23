import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";

import { CommonCodeResendAction } from "#components";

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

describe("Common CodeResendAction", () => {
  it("emits resend when button is available", async () => {
    const wrapper = await mountSuspended(CommonCodeResendAction, {
      props: {
        secondsLeft: 0,
        canResend: true,
      },
      global: {
        stubs: {
          UButton: UButtonStub,
        },
      },
    });

    const button = wrapper.find("button");
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain("Resend code");

    await button.trigger("click");
    expect(wrapper.emitted("resend")).toHaveLength(1);
  });

  it("disables resend button when resend is not allowed", async () => {
    const wrapper = await mountSuspended(CommonCodeResendAction, {
      props: {
        secondsLeft: 0,
        canResend: false,
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
    expect(wrapper.emitted("resend")).toBeUndefined();
  });

  it("shows countdown text during cooldown", async () => {
    const wrapper = await mountSuspended(CommonCodeResendAction, {
      props: {
        secondsLeft: 30,
        canResend: true,
      },
      global: {
        stubs: {
          UButton: UButtonStub,
        },
      },
    });

    expect(wrapper.find("button").exists()).toBe(false);
    expect(wrapper.text()).toContain("Resend code in 0:30");
  });
});
