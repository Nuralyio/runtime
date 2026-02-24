import { type ComponentType } from '../redux/store/component/component.interface';

export const GenerateName = (componentType: ComponentType) => {
  // Use cryptographically secure random number generation
  const randomBytes = crypto.getRandomValues(new Uint32Array(1));
  const randomNumber = randomBytes[0] % 10000;
  return `${componentType}_${randomNumber}`;
};