// src/hooks/useToastMessage.js
import { toast } from 'react-toastify';

const useToastMessage = () => {
	return {
		showSuccess: (msg) => toast.success(msg),
		showError: (msg) => toast.error(msg),
		showInfo: (msg) => toast.info(msg),
		showWarning: (msg) => toast.warn(msg),
	};
};

export default useToastMessage;
