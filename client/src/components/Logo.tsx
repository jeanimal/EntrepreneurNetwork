import { Link } from "wouter";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export default function Logo({ size = "medium", showText = true }: LogoProps) {
  // Size mapping for the SVG
  const sizes = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 40, height: 40, fontSize: 14 },
    large: { width: 56, height: 56, fontSize: 20 },
  };

  const { width, height, fontSize } = sizes[size];

  return (
    <div className="flex items-center">
      <Link href="/">
        <div className={`flex items-center justify-center cursor-pointer`}>
          <svg width={width} height={height} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            {/* Star-like splash with thicker ragged edges and grey outline - recentered */}
            <path 
              d="M20,8.5c2.1,0,2.7,2.4,3.5,4.1c1.1,2.2,2.9,2.3,5.1,2.3c2.7,0,5.5-0.2,6.9,2.5
              c1.2,2.3,0.5,5.1-0.3,7.4c-0.9,2.5,0.9,4.3,2.3,6.2c1.8,2.3,1.1,5-1.1,6.6c-2,1.5-4.3,0.4-6.4-0.3
              c-2.3-0.8-3.7,0.7-5.2,2.1c-1.9,1.7-4.6,2.4-6.8,0.7c-2.1-1.6-1.9-4.1-1.7-6.5c0.2-2.3-1.6-3.4-3.1-4.7
              c-2-1.6-3.6-3.5-2.9-6.3c0.6-2.5,3-3.2,5.3-3.7c2.2-0.4,3.3-1.9,3.9-3.9C19.9,12.7,17.7,8.5,20,8.5z"
              fill="#FFD6E0"
              stroke="#888888"
              strokeWidth="0.8"
            />
            
            {/* VC text */}
            <text x="20" y="24" fontFamily="Arial" fontSize={fontSize} fontWeight="bold" fill="#333" textAnchor="middle">
              VC
            </text>
          </svg>
        </div>
      </Link>
      
      {showText && (
        <Link href="/">
          <span className="ml-2 text-xl font-semibold text-gray-900 cursor-pointer">
            VentureConnect
          </span>
        </Link>
      )}
    </div>
  );
}