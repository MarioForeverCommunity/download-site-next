<script setup>
    import {ref, defineEmits} from 'vue';

    const thisDom = ref(null);
    const popperDom = ref(null);

    defineEmits(['click', 'showTooltip', 'hideTooltip']);

    const props = defineProps({
        inCard: {
            type: Boolean,
            default: true
        }
    });
</script>

<template>
    <div style="display: inline;" ref="thisDom" @mouseenter="props.inCard ? $parent.$emit('showTooltip', [thisDom, popperDom.innerHTML]) : $emit('showTooltip', [thisDom, popperDom.innerHTML])" @mouseleave="props.inCard ? $parent.$emit('hideTooltip', thisDom) : $emit('hideTooltip', thisDom)">
        <slot></slot>
    </div>
    <div v-show="false" ref="popperDom"><slot name="popper"></slot></div>
</template>