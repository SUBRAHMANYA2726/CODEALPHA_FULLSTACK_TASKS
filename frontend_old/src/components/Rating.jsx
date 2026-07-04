import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const Rating = ({ value, text }) => {
  const stars = [1, 2, 3, 4, 5].map((star) => {
    if (value >= star) return <FaStar key={star} className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]" />;
    if (value >= star - 0.5) return <FaStarHalfAlt key={star} className="text-yellow-400" />;
    return <FaRegStar key={star} className="text-slate-600" />;
  });

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">{stars}</div>
      {text && <span className="text-sm text-slate-400">{text}</span>}
    </div>
  );
};

export default Rating;
