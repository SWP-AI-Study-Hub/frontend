import {
  communityDocuments,
  getSavedCommunityDocuments,
  getSavedCommunityDocumentIds,
  toggleSavedCommunityDocument,
} from './community.api'

describe('community demo service', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('provides public document metadata required by UI-09', () => {
    expect(communityDocuments.length).toBeGreaterThan(0)
    expect(communityDocuments[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        category: expect.any(String),
        owner: expect.any(String),
        savedCount: expect.any(Number),
      }),
    )
  })

  it('persists save and unsave actions in the local library demo', () => {
    const documentId = communityDocuments[0].id

    expect(toggleSavedCommunityDocument(documentId)).toContain(documentId)
    expect(getSavedCommunityDocumentIds()).toContain(documentId)

    expect(toggleSavedCommunityDocument(documentId)).not.toContain(documentId)
  })

  it('returns saved community documents for the Saved page', () => {
    const document = communityDocuments[0]

    toggleSavedCommunityDocument(document.id)

    expect(getSavedCommunityDocuments()).toEqual([document])
  })
})
