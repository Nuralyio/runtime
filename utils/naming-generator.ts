import { type ComponentType } from '../redux/store/component/component.interface';

export const GenerateName = (componentType: ComponentType) => {
  const randomNumber = Math.floor(Math.random() * 10000);
  return `${componentType}_${randomNumber}`;
};