import { useState, useEffect } from 'react';
import domtoimage from 'dom-to-image-more';
import { supabase } from '@/integrations/supabase/client';
import CustomDraggable from './CustomDraggable';
import LetterTemplate from './LetterTemplate';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Eye, Edit, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface LetterBuilderProps {
  letterData: {
    id: string;
    recipientName: string;
    recipientPosition: string;
    recipientCompany: string;
    date: string;
    generatedSubject: string;
    generatedBody: string;
    writerName: string;
    project_id: string;
    document_id?: string;
    letter_number?: string;
    file_url?: string;
  };
  onLetterGenerated?: () => void;
}
const LetterBuilder: React.FC<LetterBuilderProps> = ({
  letterData,
  onLetterGenerated
}) => {
  const [letterGenerated, setLetterGenerated] = useState(false);
  const [generatedFilePath, setGeneratedFilePath] = useState<string | null>(null);
  // State for element positions - Updated to match professional layout from reference letter
  const [positions, setPositions] = useState({
    basmala: { x: 320, y: 245 },
    date: { x: 549, y: 62 },
    recipientName: { x: 506, y: 326 },
    recipientInfo: { x: 577, y: 385 },
    subject: { x: 331, y: 441 },
    greeting: { x: 577, y: 502 },
    body: { x: 129, y: 561 },
    closing1: { x: 385, y: 766 },
    signature: { x: 56, y: 933 },
    closing2: { x: 101, y: 828 },
    stamp: { x: 218, y: 933 },
  });

  // Options state
  const [includeSignature, setIncludeSignature] = useState(false);
  const [includeStamp, setIncludeStamp] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [letterNumber, setLetterNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Auto-generate letter number on mount
  useEffect(() => {
    const generateLetterNumber = async () => {
      try {
        const now = new Date();
        const yy = String(now.getFullYear()).slice(-2);
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yymm = `${yy}${mm}`;

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

        const { count } = await supabase
          .from('letters')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startOfMonth)
          .lt('created_at', startOfNextMonth);

        const generatedNumber = `AI-${yymm}-${String((count || 0) + 1).padStart(3, '0')}`;
        setLetterNumber(generatedNumber);
      } catch (error) {
        console.error('Error generating letter number:', error);
      }
    };
    generateLetterNumber();
  }, []);

  // Template URL state
  const [signatureUrl, setSignatureUrl] = useState<string>('');
  const [stampUrl, setStampUrl] = useState<string>('');

  // Load images from Supabase using signed URLs for private bucket
  useEffect(() => {
    const loadImages = async () => {
      try {
        // Load signature if needed
        if (includeSignature) {
          const { data: sigData, error: sigError } = await supabase.storage
            .from('documents')
            .createSignedUrl('signature.png', 3600);
          
          if (!sigError && sigData?.signedUrl) {
            setSignatureUrl(sigData.signedUrl);
          } else {
            console.error('Failed to load signature:', sigError);
            setSignatureUrl('');
          }
        } else {
          setSignatureUrl('');
        }

        // Load stamp if needed
        if (includeStamp) {
          const { data: stampData, error: stampError } = await supabase.storage
            .from('documents')
            .createSignedUrl('stamp.png', 3600);
          
          if (!stampError && stampData?.signedUrl) {
            setStampUrl(stampData.signedUrl);
          } else {
            console.error('Failed to load stamp:', stampError);
            setStampUrl('');
          }
        } else {
          setStampUrl('');
        }
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    
    loadImages();
  }, [includeSignature, includeStamp]);
  const handlePositionChange = (id: string, position: {
    x: number;
    y: number;
  }) => {
    setPositions(prev => ({
      ...prev,
      [id]: position
    }));
  };


  const buildCleanLetterDiv = (): HTMLDivElement => {
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;width:794px;height:1123px;background:white;overflow:hidden;font-feature-settings:normal;text-rendering:geometricPrecision;';

    // Background template
    const bg = document.createElement('img');
    bg.src = '/Letter-Template-A4.png';
    bg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;';
    bg.crossOrigin = 'anonymous';
    container.appendChild(bg);

    const baseShort = 'position:absolute;direction:rtl;white-space:nowrap;font-feature-settings:normal;text-rendering:geometricPrecision;font-family:inherit;color:#000;margin:0;padding:0;border:none;outline:none;background:none;box-shadow:none;';
    const baseLong = 'position:absolute;direction:rtl;white-space:pre-wrap;word-wrap:break-word;font-feature-settings:normal;text-rendering:geometricPrecision;font-family:inherit;color:#000;margin:0;padding:0;border:none;outline:none;background:none;box-shadow:none;';

    const addEl = (base: string, pos: { x: number; y: number }, html: string, extra: string) => {
      const el = document.createElement('div');
      el.style.cssText = base + `left:${pos.x}px;top:${pos.y}px;` + extra;
      el.innerHTML = html;
      container.appendChild(el);
    };

    const addElRight = (base: string, top: number, html: string, extra: string) => {
      const el = document.createElement('div');
      el.style.cssText = base + `right:85px;top:${top}px;` + extra;
      el.innerHTML = html;
      container.appendChild(el);
    };

    // Basmala — centered horizontally
    const basmalaEl = document.createElement('div');
    basmalaEl.style.cssText = baseShort + `left:0;top:${positions.basmala.y}px;width:100%;text-align:center;font-weight:bold;font-size:18px;`;
    basmalaEl.innerHTML = 'بسمه تعالی';
    container.appendChild(basmalaEl);

    // Date block — right-aligned, moved down
    const dateLines: string[] = [];
    if (letterNumber || letterData.letter_number) {
      dateLines.push(`شماره: ${letterNumber || letterData.letter_number}`);
    }
    dateLines.push(`تاریخ: ${formatPersianDate(letterData.date)}`);
    dateLines.push(`پیوست: ${hasAttachment ? 'دارد' : 'ندارد'}`);
    const dateEl = document.createElement('div');
    dateEl.style.cssText = baseShort + `right:100px;top:62px;white-space:normal;text-align:right;font-size:14px;line-height:1.6;`;
    dateEl.innerHTML = dateLines.join('<br/>');
    container.appendChild(dateEl);

    // Recipient name — right-aligned
    addElRight(baseShort, positions.recipientName.y, letterData.recipientName, 'text-align:right;font-weight:bold;font-size:18px;');

    // Recipient info
    let recipientInfoHtml = '';
    if (letterData.recipientPosition && letterData.recipientCompany) {
      recipientInfoHtml = `${letterData.recipientPosition} - ${letterData.recipientCompany}`;
    } else {
      recipientInfoHtml = [letterData.recipientPosition, letterData.recipientCompany].filter(Boolean).join('<br/>');
    }
    addElRight(baseShort, positions.recipientInfo.y, recipientInfoHtml, 'white-space:normal;text-align:right;font-size:16px;');

    // Subject — long text, pre-wrap
    addElRight(baseLong, positions.subject.y, `<span style="font-weight:bold;border:none;outline:none;background:none;box-shadow:none;">موضوع: </span><span style="border:none;outline:none;background:none;box-shadow:none;">${letterData.generatedSubject}</span>`, 'text-align:right;font-size:16px;max-width:580px;');

    // Greeting
    addElRight(baseShort, positions.greeting.y, 'با سلام و احترام', 'text-align:right;font-weight:500;font-size:16px;');

    // Body — long text, pre-wrap
    addElRight(baseLong, positions.body.y, letterData.generatedBody, 'text-align:right;font-size:16px;line-height:1.8;max-width:580px;');

    // Closing 1
    addElRight(baseShort, positions.closing1.y, 'پیشاپیش از حسن توجه و همکاری شما سپاسگزاریم.', 'text-align:right;font-size:16px;');

    // Closing 2 — normal for <br/> support
    addEl(baseShort, positions.closing2, 'با تشکر<br/>برخورداری<br/>مدیر عامل شرکت آدرین ایده کوشا', 'white-space:normal;text-align:center;font-size:16px;line-height:1.6;');

    // Signature
    if (includeSignature && signatureUrl) {
      const sigImg = document.createElement('img');
      sigImg.src = signatureUrl;
      sigImg.crossOrigin = 'anonymous';
      sigImg.style.cssText = `position:absolute;left:${positions.signature.x}px;top:${positions.signature.y}px;max-width:192px;max-height:96px;border:none;outline:none;background:transparent;box-shadow:none;`;
      container.appendChild(sigImg);
    }

    // Stamp
    if (includeStamp && stampUrl) {
      const stampImg = document.createElement('img');
      stampImg.src = stampUrl;
      stampImg.crossOrigin = 'anonymous';
      stampImg.style.cssText = `position:absolute;left:${positions.stamp.x}px;top:${positions.stamp.y}px;max-width:192px;max-height:192px;border:none;outline:none;background:transparent;box-shadow:none;`;
      container.appendChild(stampImg);
    }

    return container;
  };

  const generateFinalLetter = async () => {
    setIsGenerating(true);
    try {
      // Update status to preview_generated with all options
      await supabase
        .from('letters')
        .update({ 
          status: 'preview_generated',
          has_attachment: hasAttachment,
          needs_signature: includeSignature,
          needs_stamp: includeStamp,
          letter_number: letterNumber || null
        })
        .eq('id', letterData.id);

      // Build clean off-screen div for capture
      const cleanDiv = buildCleanLetterDiv();
      document.body.appendChild(cleanDiv);

      // Wait for all images to load
      const images = cleanDiv.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to load: ${img.src}`));
              })
        )
      );

      // Wait for fonts
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture clean div at 2x scale
      const dataUrl = await domtoimage.toPng(cleanDiv, {
        quality: 1,
        width: 1588,
        height: 2246,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: '794px',
          height: '1123px',
        },
      });

      // Remove clean div
      document.body.removeChild(cleanDiv);

      // Convert data URL to blob
      const fetchResp = await fetch(dataUrl);
      const blob = await fetchResp.blob();

      if (blob) {
        // Get project name from project_id
        const { data: project } = await supabase
          .from('adrian_projects')
          .select('project_name')
          .eq('project_id', letterData.project_id)
          .maybeSingle();

        // Upload with structure: {project_name}/{id}/letter.png
        const projectName = project?.project_name || letterData.project_id;
        const filePath = `${projectName}/${letterData.id}/letter.png`;
        
        const { error: uploadError } = await supabase.storage
          .from('Letters')
          .upload(filePath, blob, { upsert: true });

        if (!uploadError) {
          await supabase
            .from('letters')
            .update({ 
              status: 'final_generated',
              final_generated_at: new Date().toISOString(),
              final_image_url: filePath,
              file_url: filePath,
              mime_type: 'image/png',
              letter_title: letterData.generatedSubject,
              generated_subject: letterData.generatedSubject,
              generated_body: letterData.generatedBody,
              letter_number: letterNumber || letterData.letter_number || null,
              has_attachment: hasAttachment,
              needs_signature: includeSignature,
              needs_stamp: includeStamp,
              writer_name: letterData.writerName
            })
            .eq('id', letterData.id);
          setLetterGenerated(true);
          setGeneratedFilePath(filePath);
        }

        // Download the image
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Letter-${letterData.recipientName}-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
        if (onLetterGenerated) {
          onLetterGenerated();
        }
      }
    } catch (error) {
      console.error('Error generating letter:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert date to Persian format
  const formatPersianDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6">
      {/* Controls */}
      <div className="bg-card rounded-lg shadow-lg p-6 border">
        <h3 className="text-xl font-semibold mb-4">Persian Business Letter Composition</h3>
        <p className="text-muted-foreground mb-4">
          Position elements on your Adrian Idea branded letter template following proper Persian business letter format.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="preview" checked={previewMode} onCheckedChange={checked => setPreviewMode(checked === true)} />
            <Label htmlFor="preview" className="flex items-center gap-2">
              {previewMode ? <Eye className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {previewMode ? 'Preview Mode' : 'Edit Mode'}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="signature" checked={includeSignature} onCheckedChange={checked => setIncludeSignature(checked === true)} />
            <Label htmlFor="signature">Include Signature</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="stamp" checked={includeStamp} onCheckedChange={checked => setIncludeStamp(checked === true)} />
            <Label htmlFor="stamp">Include Company Stamp</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="attachment" checked={hasAttachment} onCheckedChange={checked => setHasAttachment(checked === true)} />
            <Label htmlFor="attachment">Include Attachment</Label>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="letterNumber">Letter Number (شماره نامه)</Label>
            <Input id="letterNumber" value={letterNumber} onChange={e => setLetterNumber(e.target.value)} placeholder="Enter letter number..." className="mt-1" />
          </div>
        </div>

        {!previewMode && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Edit Mode:</strong> Click and drag the blue dashed boxes to reposition elements. Toggle to Preview Mode to see the final result.
            </p>
          </div>}

        <div className="flex flex-wrap gap-3">
          <Button onClick={generateFinalLetter} disabled={isGenerating} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2">
            {isGenerating ? <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </> : <>
                <Download className="w-5 h-5" />
                Generate Final Letter
              </>}
          </Button>
          
          <Button
            onClick={() => {
              const subject = letterData.generatedSubject || '';
              const htmlBody = `<div dir="rtl" style="font-family: Tahoma, sans-serif; line-height: 1.8; text-align: right;">
  <p><strong>${letterData.recipientName}</strong></p>
  <p>${letterData.recipientPosition} - ${letterData.recipientCompany}</p>
  <br/>
  <p><strong>موضوع: ${subject}</strong></p>
  <br/>
  <p>با سلام و احترام</p>
  <br/>
  <p>${letterData.generatedBody}</p>
  <br/>
  <p>پیشاپیش از حسن توجه و همکاری شما سپاسگزاریم.</p>
  <br/>
  <p>با تشکر</p>
  <p>${letterData.writerName || 'برخورداری'}</p>
  <p>مدیر عامل شرکت آدرین ایده کوشا</p>
</div>`;
              const plainText = `${letterData.recipientName}\n${letterData.recipientPosition} - ${letterData.recipientCompany}\n\nموضوع: ${subject}\n\nبا سلام و احترام\n\n${letterData.generatedBody}\n\nپیشاپیش از حسن توجه و همکاری شما سپاسگزاریم.\n\nبا تشکر\n${letterData.writerName || 'برخورداری'}\nمدیر عامل شرکت آدرین ایده کوشا`;
              navigate('/email', {
                state: {
                  composeMode: 'new',
                  prefill: {
                    subject,
                    body_html: htmlBody,
                    body_text: plainText,
                    attachments: [{
                      name: `Letter-${letterData.recipientName}.png`,
                      url: generatedFilePath || letterData.file_url,
                      storage_path: generatedFilePath || letterData.file_url,
                      bucket: 'Letters'
                    }]
                  }
                }
              });
            }}
            variant="outline"
            disabled={!letterGenerated && !letterData.file_url}
            title={!letterGenerated && !letterData.file_url ? 'ابتدا نامه را تولید کنید' : ''}
            className="flex items-center gap-2"
          >
            <Mail className="w-5 h-5" />
            ارسال نامه با ایمیل
          </Button>

        </div>
      </div>

      {/* Mobile notice */}
      <p className="text-xs text-muted-foreground text-center md:hidden">
        💡 The letter builder works best on desktop. Scroll horizontally to view the full canvas.
      </p>

      {/* Letter Canvas */}
      <div className="flex justify-center overflow-auto">
        <div id="letter-canvas" dir="rtl" className="relative border-2 border-gray-300 bg-white shadow-xl overflow-hidden flex-shrink-0" style={{
        direction: 'rtl',
        width: '794px',
        height: '1123px',
        fontFeatureSettings: 'normal',
        textRendering: 'geometricPrecision' as const,
      }}>
          {/* Background Template */}
          <LetterTemplate />

          {/* Draggable Elements */}
          
          {/* Basmala - Top center */}
          <CustomDraggable id="basmala" initialPosition={positions.basmala} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-lg font-bold text-right" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              بسمه تعالی
            </div>
          </CustomDraggable>

          {/* Date and Letter Number - Top right */}
          <CustomDraggable id="date" initialPosition={positions.date} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-sm text-right space-y-1" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              {(letterNumber || letterData.letter_number) && <div>شماره: {letterNumber || letterData.letter_number}</div>}
              <div>تاریخ: {formatPersianDate(letterData.date)}</div>
              <div>پیوست: {hasAttachment ? 'دارد' : 'ندارد'}</div>
            </div>
          </CustomDraggable>

          {/* Recipient Name */}
          <CustomDraggable id="recipientName" initialPosition={positions.recipientName} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="font-bold text-lg text-right" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              {letterData.recipientName}
            </div>
          </CustomDraggable>

          {/* Combined Recipient Info (Position + Company) */}
          <CustomDraggable id="recipientInfo" initialPosition={positions.recipientInfo} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-base text-right space-y-1" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              {letterData.recipientPosition && letterData.recipientCompany ? <div>{letterData.recipientPosition} - {letterData.recipientCompany}</div> : <>
                  {letterData.recipientPosition && <div>{letterData.recipientPosition}</div>}
                  {letterData.recipientCompany && <div>{letterData.recipientCompany}</div>}
                </>}
            </div>
          </CustomDraggable>

          {/* Subject - Right aligned */}
          <CustomDraggable id="subject" initialPosition={positions.subject} onPositionChange={handlePositionChange} previewMode={previewMode} className="max-w-2xl">
            <div className="text-right" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              <span className="font-bold">موضوع: </span>
              <span>{letterData.generatedSubject}</span>
            </div>
          </CustomDraggable>

          {/* Greeting - Right side */}
          <CustomDraggable id="greeting" initialPosition={positions.greeting} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right font-medium" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              با سلام و احترام
            </div>
          </CustomDraggable>

          {/* Body */}
          <CustomDraggable id="body" initialPosition={positions.body} onPositionChange={handlePositionChange} previewMode={previewMode} className="max-w-xl">
            <div className="text-right leading-relaxed space-y-3" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              <div className="whitespace-pre-wrap">{letterData.generatedBody}</div>
            </div>
          </CustomDraggable>

          {/* Closing 1 */}
          <CustomDraggable id="closing1" initialPosition={positions.closing1} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right space-y-2" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              <div>پیشاپیش از حسن توجه و همکاری شما سپاسگزاریم.</div>
            </div>
          </CustomDraggable>

          {/* Signature */}
          {includeSignature && <CustomDraggable id="signature" initialPosition={positions.signature} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right select-none" style={{ direction: 'rtl', textAlign: 'right' }}>
              {signatureUrl ? (
                <img src={signatureUrl} alt="Signature" crossOrigin="anonymous" className="max-w-48 max-h-24 ml-auto select-none pointer-events-none" draggable="false" />
              ) : (
                <div className="w-48 h-24 border-2 border-dashed border-gray-400 rounded flex items-center justify-center text-xs text-gray-500 select-none">
                  Signature
                </div>
              )}
            </div>
          </CustomDraggable>}

          {/* Closing 2 */}
          <CustomDraggable id="closing2" initialPosition={positions.closing2} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right space-y-1" style={{
            direction: 'rtl', textAlign: 'right'
          }}>
              <div>با تشکر</div>
              <div>برخورداری</div>
              <div>مدیر عامل شرکت آدرین ایده کوشا</div>
            </div>
          </CustomDraggable>

          {/* Company Stamp */}
          {includeStamp && <CustomDraggable id="stamp" initialPosition={positions.stamp} onPositionChange={handlePositionChange} previewMode={previewMode}>
              <div className="text-right select-none" style={{ direction: 'rtl', textAlign: 'right' }}>
                {stampUrl ? <img src={stampUrl} alt="Company Stamp" crossOrigin="anonymous" className="max-w-48 max-h-48 select-none pointer-events-none" draggable="false" /> : <div className="w-48 h-48 border-2 border-dashed border-gray-400 rounded-full flex items-center justify-center text-xs text-gray-500 select-none">
                    Stamp
                  </div>}
              </div>
            </CustomDraggable>}
        </div>
      </div>
    </div>;
};
export default LetterBuilder;