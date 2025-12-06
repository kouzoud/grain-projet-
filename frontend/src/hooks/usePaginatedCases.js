import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour gérer la pagination avec infinite scroll
 * @param {Function} fetchFunction - Fonction API pour récupérer les données
 * @param {Object} filters - Filtres à appliquer (status, categorie, bounds, etc.)
 * @param {number} pageSize - Taille de la page (défaut: 20)
 * @param {number} debounceMs - Délai de debounce en ms (défaut: 300)
 */
export const usePaginatedCases = (fetchFunction, filters = {}, pageSize = 20, debounceMs = 300) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    
    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fonction pour charger une page
    const loadPage = useCallback(async (pageNumber, shouldAppend = false) => {
        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);

            const params = {
                page: pageNumber,
                size: pageSize,
                ...filters
            };

            const response = await fetchFunction(params, { signal: abortControllerRef.current.signal });
            
            // Support pour les réponses paginées Spring Boot
            const content = response.content || response.data?.content || [];
            const total = response.totalPages || response.data?.totalPages || 0;
            const elements = response.totalElements || response.data?.totalElements || 0;

            if (shouldAppend) {
                setData(prev => [...prev, ...content]);
            } else {
                setData(content);
            }

            setTotalPages(total);
            setTotalElements(elements);
            setHasMore(pageNumber < total - 1);
            setPage(pageNumber);
            setIsFirstLoad(false);

        } catch (err) {
            if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                setError(err.message || 'Erreur lors du chargement des données');
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    }, [fetchFunction, filters, pageSize]);

    // Charger la page suivante (infinite scroll)
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadPage(page + 1, true);
        }
    }, [page, hasMore, loading, loadPage]);

    // Rafraîchir (reset à la page 0)
    const refresh = useCallback(() => {
        setPage(0);
        setData([]);
        setHasMore(true);
        loadPage(0, false);
    }, [loadPage]);

    // Reset complet
    const reset = useCallback(() => {
        setData([]);
        setPage(0);
        setTotalPages(0);
        setTotalElements(0);
        setHasMore(true);
        setError(null);
        setIsFirstLoad(true);
    }, []);

    // Chargement initial et sur changement de filtres (avec debounce)
    useEffect(() => {
        // Clear debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Reset et nouvelle recherche après debounce
        debounceTimerRef.current = setTimeout(() => {
            reset();
            loadPage(0, false);
        }, debounceMs);

        // Cleanup
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

    return {
        data,
        page,
        totalPages,
        totalElements,
        hasMore,
        loading,
        error,
        isFirstLoad,
        loadMore,
        refresh,
        reset
    };
};

/**
 * Hook pour détection du scroll en bas de page (infinite scroll)
 * @param {Function} callback - Fonction à appeler quand on atteint le bas
 * @param {boolean} enabled - Activer/désactiver la détection
 * @param {number} threshold - Distance du bas en px pour déclencher (défaut: 200)
 */
export const useInfiniteScroll = (callback, enabled = true, threshold = 200) => {
    useEffect(() => {
        if (!enabled) return;

        const handleScroll = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const clientHeight = document.documentElement.clientHeight || window.innerHeight;
            
            const scrolledToBottom = scrollHeight - scrollTop - clientHeight < threshold;
            
            if (scrolledToBottom) {
                callback();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [callback, enabled, threshold]);
};

export default usePaginatedCases;
