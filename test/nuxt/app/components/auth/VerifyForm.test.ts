import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";

import { AuthVerifyForm } from "#components";

const UButtonStub = defineComponent({
  name: "UButton",
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "button",
    },
  },
  emits: ["click"],
  template:
    '<button :disabled="disabled" :type="type" @click="$emit(\'click\')">{{ label }}<slot /></button>',
});

const UPinInputStub = defineComponent({
  name: "UPinInput",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["complete", "update:modelValue"],
  template: '<div data-test="pin-input" />',
});

const globalStubs = {
  UButton: UButtonStub,
  UPinInput: UPinInputStub,
};

const findButtonByLabel = (labels: string[], label: string) => {
  const index = labels.indexOf(label);
  return index === -1 ? -1 : index;
};

describe("Auth VerifyForm", () => {
  it("disables verify button until email and 6-digit OTP are present", async () => {
    const wrapper = await mountSuspended(AuthVerifyForm, {
      props: {
        email: "",
        isSending: false,
        isVerifying: false,
        otpValue: ["1", "2", "3"],
        resendSeconds: 0,
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    const labels = buttons.map((button) => button.text().trim());
    const verifyButton =
      buttons[findButtonByLabel(labels, "Verify & Continue")];

    expect(verifyButton?.attributes("disabled")).toBeDefined();
  });

  it("enables verify and emits verify/back/resend actions", async () => {
    const wrapper = await mountSuspended(AuthVerifyForm, {
      props: {
        email: "user@example.com",
        isSending: false,
        isVerifying: false,
        otpValue: ["1", "2", "3", "4", "5", "6"],
        resendSeconds: 0,
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    const labels = buttons.map((button) => button.text().trim());

    const verifyButton =
      buttons[findButtonByLabel(labels, "Verify & Continue")];
    const backButton = buttons[findButtonByLabel(labels, "Back")];
    const resendButton = buttons[findButtonByLabel(labels, "Resend code")];

    expect(verifyButton?.attributes("disabled")).toBeUndefined();

    await verifyButton?.trigger("click");
    await backButton?.trigger("click");
    await resendButton?.trigger("click");

    expect(wrapper.emitted("verify")).toHaveLength(1);
    expect(wrapper.emitted("back")).toHaveLength(1);
    expect(wrapper.emitted("resend")).toHaveLength(1);
  });

  it("disables resend while cooldown is active", async () => {
    const wrapper = await mountSuspended(AuthVerifyForm, {
      props: {
        email: "user@example.com",
        isSending: false,
        isVerifying: false,
        otpValue: ["1", "2", "3", "4", "5", "6"],
        resendSeconds: 30,
      },
      global: {
        stubs: globalStubs,
      },
    });

    const buttons = wrapper.findAll("button");
    const labels = buttons.map((button) => button.text().trim());
    const resendButton = buttons[findButtonByLabel(labels, "Resend code")];

    expect(resendButton?.attributes("disabled")).toBeDefined();
    expect(wrapper.text()).toContain("in 0:30");
  });
});
