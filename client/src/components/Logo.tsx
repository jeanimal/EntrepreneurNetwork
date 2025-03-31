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
            {/* Pink paint splash with asymmetric rounded star-like edges */}
            <path 
              d="M33.7,15.2c1.3,2.9,0.3,5.7-1.2,8.4c-0.7,1.3-2.3,2.1-3.4,3.1c-2.3,2-5.1,2.8-8.1,2.9
              c-3,0.1-5.5-1.4-7.9-3.1c-1.6-1.2-3.1-2.4-4.1-4.1c-1.5-2.6-1.2-5.1,0.2-7.6c1.4-2.5,3.3-4.4,6-5.4
              c3.8-1.5,7.6-1.1,11.3,0.2c1.5,0.5,2.7,1.7,4,2.6C31.5,13,32.7,14.2,33.7,15.2z" 
              fill="#FFD6E0" 
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