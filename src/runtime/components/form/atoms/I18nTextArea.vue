<template>
  <v-col v-if="args.key" cols="12" class="py-0 text-overline">
    {{ $t(args.key, 2) }}
  </v-col>
  <v-col cols="12" md="6">
    <div class="d-flex align-center">
      <span class="flag flag-fra" />
      <div class="text-caption">
        {{ $t("french-version") }}
      </div>
    </div>
    <FormAtomsTextArea
      :args
      :level="[...level, 'fr']"
      :category
      :no-padding="true"
    />
  </v-col>
  <v-col cols="12" md="6">
    <div class="d-flex align-center">
      <span class="flag flag-gbr" />
      <div class="text-caption">
        {{ $t("english-version") }}
      </div>
    </div>
    <FormAtomsTextArea
      :args
      :level="[...level, 'en']"
      :category
      :no-padding="true"
    />
  </v-col>
</template>

<script setup>
defineProps({
  args: {
    type: Object,
    required: true,
  },
  level: {
    type: Array,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
})
</script>

<style lang="scss" scoped>
@use "../../../assets/flags" as * with (
  $width: 30px,
  $height: 15px
);

.flag {
  display: inline-block;
  width: 30px;
  height: 15px;
  margin-right: 6px;
  flex-shrink: 0;
}

.flag-fra {
  @include flag-fra();
}

.flag-gbr {
  @include flag-gbr();
}
</style>
