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
            {/* Pink paint splash with more ragged, asymmetric edges - 15% bigger */}
            <path 
              d="M36.8,14.2c1.5,3.3,0.4,6.5-1.4,9.7c-0.8,1.5-2.6,2.4-3.9,3.6c-2.6,2.3-5.9,3.2-9.3,3.3
              c-3.5,0.1-6.3-1.6-9.1-3.6c-1.8-1.4-3.6-2.8-4.7-4.7c-1.7-3-1.4-5.9,0.2-8.7c1.6-2.9,3.8-5.1,6.9-6.2
              c4.4-1.7,8.7-1.3,13,0.2c1.7,0.6,3.1,2,4.6,3c0.9,0.8,1.7,1.8,2.5,2.1C36.3,13.2,37.2,12.1,36.8,14.2z
              M30.3,9.8c0.6-1.1,2.4-0.2,3.5-0.7c0.9-0.3,1-1.8,1.7-0.6c0.4,0.7-0.8,1.8-1.2,2.5
              C33.8,11.7,29.5,11.3,30.3,9.8z
              M9.2,22.5c-1.2,0.4-2.3-0.9-2.8,0.4c-0.4,1.1,1.5,2.6,2.4,3.2c0.8,0.5,1.8-0.3,1.5-1.3
              C10.2,23.9,10.1,22.1,9.2,22.5z" 
              fill="#FFD6E0" 
            />
            
            {/* VC text */}
            <text x="20" y="23" fontFamily="Arial" fontSize={fontSize} fontWeight="bold" fill="#333" textAnchor="middle">
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