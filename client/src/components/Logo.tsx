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
            {/* Star-like splash with thicker ragged edges and grey outline - 10% wider */}
            <path 
              d="M17,3c2.3,0,3.0,2.4,3.9,4.1c1.2,2.2,3.2,2.3,5.6,2.3c3.0,0,6.1-0.2,7.6,2.5
              c1.3,2.3,0.6,5.1-0.3,7.4c-1.0,2.5,1.0,4.3,2.5,6.2c2.0,2.3,1.2,5-1.2,6.6c-2.2,1.5-4.7,0.4-7.0-0.3
              c-2.5-0.8-4.1,0.7-5.7,2.1c-2.1,1.7-5.1,2.4-7.5,0.7c-2.3-1.6-2.1-4.1-1.9-6.5c0.2-2.3-1.8-3.4-3.4-4.7
              c-2.2-1.6-4.0-3.5-3.2-6.3c0.7-2.5,3.3-3.2,5.8-3.7c2.4-0.4,3.6-1.9,4.3-3.9C16.9,7.2,14.5,3,17,3z"
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