import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
// Every listing entry point opens the same supported create/edit workflow.
export default function ListingFormRedirect() {
  const { isListCarOpen, setIsListCarOpen } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (isListCarOpen) { setIsListCarOpen(false); navigate('/sell'); }
  }, [isListCarOpen, setIsListCarOpen, navigate]);
  return null;
}
