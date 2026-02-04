import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { supabase } from '@/integrations/supabase/client';
import CustomDraggable from './CustomDraggable';
import LetterTemplate from './LetterTemplate';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Eye, Edit, Terminal } from 'lucide-react';
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
  };
  onLetterGenerated?: () => void;
}
const LetterBuilder: React.FC<LetterBuilderProps> = ({
  letterData,
  onLetterGenerated
}) => {
  // State for element positions - Updated to match professional layout from reference letter
  const [positions, setPositions] = useState({
    basmala: {
      x: 320,
      y: 245
    },
    date: {
      x: 562,
      y: 75
    },
    recipientName: {
      x: 548,
      y: 328
    },
    recipientInfo: {
      x: 594,
      y: 385
    },
    // combined position+company
    subject: {
      x: 197,
      y: 444
    },
    greeting: {
      x: 575,
      y: 502
    },
    body: {
      x: 121,
      y: 557
    },
    closing1: {
      x: 351,
      y: 767
    },
    signature: {
      x: 56,
      y: 933
    },
    closing2: {
      x: 101,
      y: 828
    },
    stamp: {
      x: 218,
      y: 933
    }
  });

  // Options state
  const [includeSignature, setIncludeSignature] = useState(false);
  const [includeStamp, setIncludeStamp] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasAttachment, setHasAttachment] = useState(false);
  const [letterNumber, setLetterNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const logCurrentPositions = () => {
    console.log('=== Current Letter Element Positions ===');
    console.log(JSON.stringify(positions, null, 2));
    console.log('=== Copy-paste ready format ===');
    console.log(`const [positions, setPositions] = useState({
  basmala: { x: ${positions.basmala.x}, y: ${positions.basmala.y} },
  date: { x: ${positions.date.x}, y: ${positions.date.y} },
  recipientName: { x: ${positions.recipientName.x}, y: ${positions.recipientName.y} },
  recipientInfo: { x: ${positions.recipientInfo.x}, y: ${positions.recipientInfo.y} },
  subject: { x: ${positions.subject.x}, y: ${positions.subject.y} },
  greeting: { x: ${positions.greeting.x}, y: ${positions.greeting.y} },
  body: { x: ${positions.body.x}, y: ${positions.body.y} },
  closing1: { x: ${positions.closing1.x}, y: ${positions.closing1.y} },
  closing2: { x: ${positions.closing2.x}, y: ${positions.closing2.y} },
  signature: { x: ${positions.signature.x}, y: ${positions.signature.y} },
  stamp: { x: ${positions.stamp.x}, y: ${positions.stamp.y} }
});`);
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

      const letterElement = document.getElementById('letter-canvas');
      if (letterElement) {
        const canvas = await html2canvas(letterElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123
        });

        // Convert canvas to blob for upload
        const blob = await new Promise<Blob>(resolve => {
          canvas.toBlob(blob => {
            if (blob) resolve(blob);
          }, 'image/png');
        });

        if (blob) {
          // Get project name from project_id
          const { data: project } = await supabase
            .from('adrian_projects')
            .select('project_name')
            .eq('project_id', letterData.project_id)
            .single();

          // Upload with structure: {project_name}/{id}/letter.png
          const projectName = project?.project_name || letterData.project_id;
          const filePath = `${projectName}/${letterData.id}/letter.png`;
          
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, blob, { upsert: true });

          if (!uploadError) {
            // Update letter status to final_generated with file URL and mime type
            await supabase
              .from('letters')
              .update({ 
                status: 'final_generated',
                final_generated_at: new Date().toISOString(),
                final_image_url: filePath,
                file_url: filePath,
                mime_type: 'image/png'
              })
              .eq('id', letterData.id);
          }
        }

        // Download the image
        canvas.toBlob(blob => {
          if (blob) {
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
        }, 'image/png');
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
  return <div className="space-y-6 max-w-6xl mx-auto p-6">
      {/* Controls */}
      <div className="bg-card rounded-lg shadow-lg p-6 border">
        <h3 className="text-xl font-semibold mb-4">Persian Business Letter Composition</h3>
        <p className="text-muted-foreground mb-4">
          Position elements on your Adrian Idea branded letter template following proper Persian business letter format.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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

        <div className="flex gap-3">
          <Button onClick={generateFinalLetter} disabled={isGenerating} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2">
            {isGenerating ? <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </> : <>
                <Download className="w-5 h-5" />
                Generate Final Letter
              </>}
          </Button>
          
          <Button onClick={logCurrentPositions} variant="outline" className="flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            Log Current Positions
          </Button>
        </div>
      </div>

      {/* Letter Canvas */}
      <div className="flex justify-center">
        <div id="letter-canvas" className="relative border-2 border-gray-300 bg-white shadow-xl overflow-hidden" style={{
        width: '794px',
        height: '1123px'
      }}>
          {/* Background Template */}
          <LetterTemplate />

          {/* Draggable Elements */}
          
          {/* Basmala - Top center */}
          <CustomDraggable id="basmala" initialPosition={positions.basmala} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-lg font-bold text-center" style={{
            direction: 'rtl'
          }}>
              بسمه تعالی
            </div>
          </CustomDraggable>

          {/* Date and Letter Number - Top right */}
          <CustomDraggable id="date" initialPosition={positions.date} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-sm text-right space-y-1" style={{
            direction: 'rtl'
          }}>
              {letterData.letter_number && <div>شماره: {letterData.letter_number}</div>}
              <div>تاریخ: {formatPersianDate(letterData.date)}</div>
              <div>پیوست: {hasAttachment ? 'دارد' : 'ندارد'}</div>
            </div>
          </CustomDraggable>

          {/* Recipient Name */}
          <CustomDraggable id="recipientName" initialPosition={positions.recipientName} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="font-bold text-lg text-right" style={{
            direction: 'rtl'
          }}>
              {letterData.recipientName}
            </div>
          </CustomDraggable>

          {/* Combined Recipient Info (Position + Company) */}
          <CustomDraggable id="recipientInfo" initialPosition={positions.recipientInfo} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-base text-right space-y-1" style={{
            direction: 'rtl'
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
            direction: 'rtl'
          }}>
              <span className="font-bold">موضوع: </span>
              <span>{letterData.generatedSubject}</span>
            </div>
          </CustomDraggable>

          {/* Greeting - Right side */}
          <CustomDraggable id="greeting" initialPosition={positions.greeting} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right font-medium" style={{
            direction: 'rtl'
          }}>
              با سلام و احترام
            </div>
          </CustomDraggable>

          {/* Body */}
          <CustomDraggable id="body" initialPosition={positions.body} onPositionChange={handlePositionChange} previewMode={previewMode} className="max-w-xl">
            <div className="text-right leading-relaxed space-y-3" style={{
            direction: 'rtl'
          }}>
              <div className="whitespace-pre-wrap">{letterData.generatedBody}</div>
            </div>
          </CustomDraggable>

          {/* Closing 1 */}
          <CustomDraggable id="closing1" initialPosition={positions.closing1} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right space-y-2" style={{
            direction: 'rtl'
          }}>
              <div>پیشاپیش از حسن توجه و همکاری شما سپاسگزاریم.</div>
            </div>
          </CustomDraggable>

          {/* Signature */}
          {includeSignature && <CustomDraggable id="signature" initialPosition={positions.signature} onPositionChange={handlePositionChange} previewMode={previewMode}>
            <div className="text-right select-none" style={{ direction: 'rtl' }}>
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
            <div className="text-center space-y-1" style={{
            direction: 'rtl'
          }}>
              <div>با تشکر</div>
              <div>برخورداری</div>
              <div>مدیر عامل شرکت آدرین ایده کوشا</div>
            </div>
          </CustomDraggable>

          {/* Company Stamp */}
          {includeStamp && <CustomDraggable id="stamp" initialPosition={positions.stamp} onPositionChange={handlePositionChange} previewMode={previewMode}>
              <div className="select-none">
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