import { mount } from '@vue/test-utils'
import Challenge from '@/components/Challenge.vue'

let wrapper;

beforeEach(() => {
    wrapper = mount(Challenge);
});

afterEach(() => {
    wrapper.unmount();
});

describe('Challenge.vue', () => {
    test('renders tooling box', () => {
        expect(wrapper.findAll('#tooling').length).toBe(1);
    });

    test('generates correct shape when selected', () => {
        wrapper.vm.model.shape = 'polygon'
        wrapper.vm.model.dimensions[0] = '3'

        const createShapeBtn = wrapper.find('#create-shape')
        createShapeBtn.trigger('click')
        expect(wrapper.findAll('polygon').length).toBe(1);
    })
});