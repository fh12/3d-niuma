import { Card, CardBody } from "@nextui-org/react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function MobilePrompt() {
    const [qrCodeUrl, setQrCodeUrl] = useState("");

    useEffect(() => {
        // 获取当前页面URL并生成二维码
        const generateQR = async () => {
            try {
                const url = window.location.href;
                const qrDataUrl = await QRCode.toDataURL(url, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: "#000000",
                        light: "#ffffff",
                    },
                });
                setQrCodeUrl(qrDataUrl);
            } catch (err) {
                console.error("二维码生成失败:", err);
            }
        };

        generateQR();
    }, []);

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <Card className="w-[90%] max-w-[500px]">
                <CardBody className="text-center p-8">
                    <h2 className="text-2xl font-bold mb-4">请使用手机访问</h2>
                    <div className="flex justify-center mb-6">
                        {qrCodeUrl && (
                            <img
                                src={qrCodeUrl}
                                alt="二维码"
                                className="w-48 h-48"
                            />
                        )}
                    </div>
                    <p className="text-gray-600 mb-4">
                        为了获得最佳游戏体验，请使用手机扫描上方二维码或直接在手机浏览器中访问当前网址。
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                        当前设备不支持触摸控制，可能会影响游戏体验。
                    </div>
                    <div className="mt-4 text-xs text-gray-400 break-all">
                        {window.location.href}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
