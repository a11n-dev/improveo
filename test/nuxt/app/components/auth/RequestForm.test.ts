import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent } from "vue";
import { describe, expect, it } from "vitest";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../../../../../shared/constants/validation";
import {
  AuthLoginSchema,
  AuthRegisterSchema,
} from "../../../../../shared/validation/auth";
import { AuthRequestForm } from "#components";

const UFormStub = defineComponent({
  name: "UForm",
  props: {
    state: {
      type: Object,
      required: true,
    },
  },
  emits: ["submit"],
  template:
    '<form data-test="u-form" @submit.prevent="$emit(\'submit\', { data: state })"><slot /></form>',
});

const UFormFieldStub = defineComponent({
  name: "UFormField",
  props: {
    hint: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: "",
    },
  },
  template:
    '<div><label>{{ label }}</label><span v-if="hint">{{ hint }}</span><slot /></div>',
});

const UInputStub = defineComponent({
  name: "UInput",
  props: {
    autocomplete: {
      type: String,
      default: undefined,
    },
    maxlength: {
      type: [String, Number],
      default: undefined,
    },
    minlength: {
      type: [String, Number],
      default: undefined,
    },
    modelValue: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      default: "text",
    },
  },
  emits: ["update:modelValue"],
  template:
    '<input :autocomplete="autocomplete" :maxlength="maxlength" :minlength="minlength" :type="type" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
});

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
    '<button :disabled="disabled" :type="type" @click="$emit(\'click\')">{{ label }}</button>',
});

const globalStubs = {
  UButton: UButtonStub,
  UForm: UFormStub,
  UFormField: UFormFieldStub,
  UInput: UInputStub,
};

describe("Auth RequestForm", () => {
  it("shows display name input in register mode with configured bounds", async () => {
    const wrapper = await mountSuspended(AuthRequestForm, {
      props: {
        isRegister: true,
        isSending: false,
        schema: AuthRegisterSchema,
        state: {
          email: "user@example.com",
          name: "",
        },
      },
      global: {
        stubs: globalStubs,
      },
    });

    const nameInput = wrapper.find('input[autocomplete="name"]');
    const emailInput = wrapper.find('input[autocomplete="email"]');

    expect(nameInput.exists()).toBe(true);
    expect(nameInput.attributes("minlength")).toBe(
      String(PROFILE_NAME_MIN_LENGTH),
    );
    expect(nameInput.attributes("maxlength")).toBe(
      String(PROFILE_NAME_MAX_LENGTH),
    );
    expect(emailInput.attributes("maxlength")).toBe(String(EMAIL_MAX_LENGTH));
    expect(wrapper.text()).toContain(
      `Min ${PROFILE_NAME_MIN_LENGTH} characters`,
    );
  });

  it("hides display name input in login mode and emits submit", async () => {
    const state = {
      email: "user@example.com",
      name: "",
    };

    const wrapper = await mountSuspended(AuthRequestForm, {
      props: {
        isRegister: false,
        isSending: false,
        schema: AuthLoginSchema,
        state,
      },
      global: {
        stubs: globalStubs,
      },
    });

    expect(wrapper.find('input[autocomplete="name"]').exists()).toBe(false);

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.text()).toContain("Sign in");

    await wrapper.find('[data-test="u-form"]').trigger("submit");

    expect(wrapper.emitted("submit")?.[0]?.[0]).toMatchObject({
      data: state,
    });
  });

  it("disables submit only while isSending is true", async () => {
    const wrapper = await mountSuspended(AuthRequestForm, {
      props: {
        isRegister: false,
        isSending: true,
        canSubmit: false,
        schema: AuthLoginSchema,
        state: {
          email: "user@example.com",
          name: "",
        },
      },
      global: {
        stubs: globalStubs,
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.attributes("disabled")).toBeDefined();
  });

  it("enables submit when isSending is false regardless of canSubmit", async () => {
    const wrapper = await mountSuspended(AuthRequestForm, {
      props: {
        isRegister: false,
        isSending: false,
        canSubmit: false,
        schema: AuthLoginSchema,
        state: {
          email: "user@example.com",
          name: "",
        },
      },
      global: {
        stubs: globalStubs,
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.attributes("disabled")).toBeUndefined();
  });
});
