export const createTransactionId = () => {
  return `tran_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
};
