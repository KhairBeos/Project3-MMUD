import { cn } from "../../lib/utils";

type AuthOverlayProps = {
  isSignUp: boolean;
  onShowLogin: () => void;
  onShowRegister: () => void;
};

export const AuthOverlay = ({ isSignUp, onShowLogin, onShowRegister }: AuthOverlayProps) => {
  return (
    <div
      className={cn(
        "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-30",
        isSignUp && "-translate-x-full"
      )}
    >
      <div
        className={cn(
          "bg-linear-to-r from-blue-600 to-indigo-500 text-white relative -left-full h-full w-[200%] flex items-center justify-between transition-transform duration-700",
          isSignUp ? "translate-x-1/2" : "translate-x-0"
        )}
      >
        <div className="w-1/2 flex flex-col items-center px-10 text-center">
          <h1 className="font-bold text-3xl mb-4">Chào mừng trở lại!</h1>
          <p className="font-light text-sm mb-7">Đăng nhập để tiếp tục cuộc trò chuyện.</p>
          <button
            onClick={onShowLogin}
            className="border border-white px-10 py-2 rounded-full uppercase font-semibold hover:bg-white hover:text-blue-600 transition-all"
          >
            Đăng Nhập
          </button>
        </div>

        <div className="w-1/2 flex flex-col items-center px-10 text-center">
          <h1 className="font-bold text-3xl mb-4">Xin chào!</h1>
          <p className="font-light text-sm mb-7">Hãy nhập thông tin và bắt đầu hành trình.</p>
          <button
            onClick={onShowRegister}
            className="border border-white px-10 py-2 rounded-full uppercase font-semibold hover:bg-white hover:text-blue-600 transition-all"
          >
            Đăng Ký
          </button>
        </div>
      </div>
    </div>
  );
};
