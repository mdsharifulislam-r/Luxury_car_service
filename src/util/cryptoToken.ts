import crypto from 'crypto';

const cryptoToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sizableToken = (size: number) => {
  return crypto.randomBytes(size).toString('hex');
}
export default cryptoToken;
